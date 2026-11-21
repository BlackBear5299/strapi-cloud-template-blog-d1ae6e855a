import type { Core } from '@strapi/strapi';

const PUBLIC_PERMISSIONS: Record<string, string[]> = {
  'api::service.service': ['find', 'findOne'],
  'api::blog-post.blog-post': ['find', 'findOne'],
  'api::testimonial.testimonial': ['find', 'findOne'],
  'api::site-setting.site-setting': ['find'],
  'api::contact-message.contact-message': ['create'],
  'api::compliance-date.compliance-date': ['find', 'findOne'],
};

/**
 * Public self-registration is never wanted here (no site users exist), so it
 * is switched off on every boot: the advanced "allow register" setting AND
 * the Public role's register permission.
 */
async function disablePublicRegistration(strapi: Core.Strapi) {
  const store = strapi.store({ type: 'plugin', name: 'users-permissions', key: 'advanced' });
  const advanced = ((await store.get()) as Record<string, unknown> | null) ?? {};
  if (advanced.allow_register !== false) {
    await store.set({ value: { ...advanced, allow_register: false } });
  }

  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!publicRole) return;
  await strapi.query('plugin::users-permissions.permission').deleteMany({
    where: { action: 'plugin::users-permissions.auth.register', role: publicRole.id },
  });
}

/**
 * On-demand revalidation of the Next.js site. Configured from env so the
 * shared secret never lives in git:
 *   REVALIDATE_WEBHOOK_URL  e.g. https://www.carajnigoswami.com/api/revalidate
 *   REVALIDATE_SECRET       sent as the x-revalidate-secret header
 * Created or updated in place (by name) on every boot, then registered with
 * the running webhook runner, which loaded the stored webhooks just before
 * this bootstrap ran.
 */
const REVALIDATE_WEBHOOK_NAME = 'frontend-revalidate';
const REVALIDATE_EVENTS = ['entry.publish', 'entry.unpublish', 'entry.update', 'entry.delete'];

async function ensureRevalidateWebhook(strapi: Core.Strapi) {
  const url = process.env.REVALIDATE_WEBHOOK_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) {
    strapi.log.warn('[revalidate] REVALIDATE_WEBHOOK_URL / REVALIDATE_SECRET not set; webhook not configured');
    return;
  }

  const store = strapi.get('webhookStore');
  const runner = strapi.get('webhookRunner');
  const data = {
    name: REVALIDATE_WEBHOOK_NAME,
    url,
    headers: { 'x-revalidate-secret': secret },
    events: REVALIDATE_EVENTS,
    isEnabled: true,
  };

  const existing = (await store.findWebhooks()).find(
    (w: { name: string }) => w.name === REVALIDATE_WEBHOOK_NAME
  );
  if (existing) {
    const updated = await store.updateWebhook(existing.id, data);
    if (updated) runner.update(updated);
  } else {
    const created = await store.createWebhook(data);
    runner.add(created);
  }
  strapi.log.info(`[revalidate] webhook '${REVALIDATE_WEBHOOK_NAME}' configured`);
}

/**
 * Initial compliance calendar: every date the website had hard-coded in
 * lib/deadlines.ts (AY 2026-27, supplied by Rajni). Seeded once, published,
 * only when the collection is empty — edits in the admin are never undone.
 * audience/sourceUrl are left empty: the source list never stated them.
 */
const COMPLIANCE_SEED = [
  { dueDate: '2026-09-15', title: 'Advance tax — second instalment', detail: "45% of the year's liability, cumulative", tags: ['advance-tax', 'income-tax'] },
  { dueDate: '2026-09-30', title: 'Tax audit report', detail: 'For taxpayers whose accounts require audit', tags: ['audit'] },
  { dueDate: '2026-10-31', title: 'Income tax return — audit cases', detail: 'Where a tax audit report was required', tags: ['income-tax', 'audit'] },
  { dueDate: '2026-12-15', title: 'Advance tax — third instalment', detail: "75% of the year's liability, cumulative", tags: ['advance-tax', 'income-tax'] },
  { dueDate: '2026-12-31', title: 'Belated or revised return', detail: 'The last date to file for AY 2026-27 if the original deadline was missed', tags: ['income-tax'] },
  { dueDate: '2027-03-15', title: 'Advance tax — final instalment', detail: "100% of the year's liability", tags: ['advance-tax', 'income-tax'] },
];

async function seedComplianceDates(strapi: Core.Strapi) {
  const existing = await strapi.documents('api::compliance-date.compliance-date').findMany({ limit: 1 });
  if (existing.length > 0) return;
  for (const item of COMPLIANCE_SEED) {
    await strapi.documents('api::compliance-date.compliance-date').create({
      data: item,
      status: 'published',
    });
  }
  strapi.log.info(`[seed] created ${COMPLIANCE_SEED.length} compliance dates`);
}

async function setPublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) return;

  for (const [uid, actions] of Object.entries(PUBLIC_PERMISSIONS)) {
    for (const action of actions) {
      const fullAction = `${uid}.${action}`;
      const existing = await strapi
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: fullAction, role: publicRole.id } });

      if (existing && !existing.enabled) {
        await strapi
          .query('plugin::users-permissions.permission')
          .update({ where: { id: existing.id }, data: { enabled: true } });
      } else if (!existing) {
        await strapi.query('plugin::users-permissions.permission').create({
          data: { action: fullAction, role: publicRole.id, enabled: true },
        });
      }
    }
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seedIfEmpty(strapi: Core.Strapi) {
  const services = await strapi.documents('api::service.service').findMany({ limit: 1 });
  if (services.length === 0) {
    const serviceData = [
      {
        title: 'Income Tax Filing & Planning',
        shortDescription: 'Accurate, on-time filing for individuals, professionals, and businesses, with year-round planning to legally minimise your tax burden.',
        description:
          'We prepare and file income tax returns for salaried individuals, professionals, freelancers, and businesses. Beyond filing, we work with you throughout the year on tax-saving investments, advance tax estimates, and compliance so there are no surprises at year end.',
        icon: 'receipt',
        order: 1,
      },
      {
        title: 'GST Registration & Returns',
        shortDescription: 'End-to-end GST support — registration, monthly/quarterly filing, reconciliation, and notice handling.',
        description:
          'From new GST registration to monthly and quarterly return filing (GSTR-1, GSTR-3B, GSTR-9), input tax credit reconciliation, and responding to department notices — we keep your business fully compliant.',
        icon: 'file-check',
        order: 2,
      },
      {
        title: 'Statutory & Tax Audit',
        shortDescription: 'Independent, thorough audits for companies, firms, and trusts as required under the Companies Act and Income Tax Act.',
        description:
          'We conduct statutory audits, tax audits, and internal audits with a focus on accuracy and genuinely useful findings — not just a signed report. Clear communication throughout, no last-minute surprises.',
        icon: 'shield-check',
        order: 3,
      },
      {
        title: 'Bookkeeping & Accounting',
        shortDescription: 'Monthly bookkeeping, financial statements, and MIS reports so you always know where your business stands.',
        description:
          'We handle day-to-day bookkeeping, bank reconciliation, ledger maintenance, and monthly/quarterly financial statements, giving you clean books and clear MIS reports to run your business with confidence.',
        icon: 'book-open',
        order: 4,
      },
      {
        title: 'Business Registration & Company Formation',
        shortDescription: 'Company incorporation, LLP formation, partnership deeds, and licensing — set up right from day one.',
        description:
          'Starting a new venture? We help with private limited company incorporation, LLP formation, partnership registration, and the various licenses and registrations (MSME, Shops & Establishment, etc.) new businesses need.',
        icon: 'briefcase',
        order: 5,
      },
      {
        title: 'Financial & Retirement Planning',
        shortDescription: 'Practical, jargon-free guidance on investments, insurance, and retirement planning tailored to your goals.',
        description:
          'We offer personal financial planning support — reviewing your investments, insurance cover, and retirement goals, and mapping out a practical plan to get there, in plain language.',
        icon: 'trending-up',
        order: 6,
      },
    ];
    for (const s of serviceData) {
      await strapi.documents('api::service.service').create({
        data: { ...s, slug: slugify(s.title) },
        status: 'published',
      });
    }
  }

  const posts = await strapi.documents('api::blog-post.blog-post').findMany({ limit: 1 });
  if (posts.length === 0) {
    const postData = [
      {
        title: 'Key Income Tax Deadlines to Know This Year',
        excerpt: 'A quick rundown of the filing dates individuals and businesses should keep on their calendar this financial year.',
        content:
          'Missing a tax deadline can mean unnecessary interest and penalties. Here are the key dates to watch: advance tax instalments, the ITR filing deadline for individuals, and the due date for businesses requiring an audit. Set reminders a few weeks ahead so you have time to gather documents and avoid a last-minute scramble.',
        publishedDate: new Date().toISOString().slice(0, 10),
        author: 'CA Practice',
      },
      {
        title: 'GST Return Filing: Common Mistakes to Avoid',
        excerpt: 'The small errors in GSTR filings that most often trigger notices — and how to steer clear of them.',
        content:
          'Mismatched invoices, claiming input tax credit on ineligible items, and late filings are among the most common issues we see. Reconciling your books against your GSTR-2B every month, rather than just before the deadline, catches most problems early and keeps your credit claims clean.',
        publishedDate: new Date().toISOString().slice(0, 10),
        author: 'CA Practice',
      },
      {
        title: '5 Tax-Saving Options Worth Considering Before Year End',
        excerpt: 'A practical look at the deductions and investment options that can meaningfully reduce your tax bill.',
        content:
          'Beyond the familiar Section 80C investments, there are several other avenues worth reviewing each year — health insurance premiums, NPS contributions, and home loan interest among them. The right mix depends on your income bracket and existing commitments, so it is worth a proper review rather than a rushed, last-week decision.',
        publishedDate: new Date().toISOString().slice(0, 10),
        author: 'CA Practice',
      },
    ];
    for (const p of postData) {
      await strapi.documents('api::blog-post.blog-post').create({
        data: { ...p, slug: slugify(p.title) },
        status: 'published',
      });
    }
  }

  const settings = await strapi.documents('api::site-setting.site-setting').findMany({ limit: 1 });
  if (settings.length === 0) {
    await strapi.documents('api::site-setting.site-setting').create({
      data: {
        businessName: '[Your Mom\'s Name], Chartered Accountant',
        tagline: 'Clear, reliable accounting and tax guidance for individuals and businesses.',
        bio:
          '[Your Mom\'s Name] is a practicing Chartered Accountant with [X] years of experience helping individuals, professionals, and small businesses stay compliant and plan ahead with confidence. The practice focuses on clear communication, on-time filings, and genuinely useful advice — no jargon, no last-minute surprises.',
        email: 'contact@example.com',
        phone: '+91 00000 00000',
        whatsappNumber: '+91 00000 00000',
        address: '[Office address, City, State, PIN code]',
        credentials: 'Chartered Accountant (ICAI) — Membership No. [XXXXXX]',
        yearsExperience: 10,
        linkedinUrl: '',
      },
      status: 'published',
    });
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await setPublicPermissions(strapi);
    await disablePublicRegistration(strapi);
    await seedIfEmpty(strapi);
    await seedComplianceDates(strapi);
    await ensureRevalidateWebhook(strapi);
  },
};
