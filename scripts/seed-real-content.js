'use strict';

const fs = require('fs');
const path = require('path');
const { createStrapi } = require('@strapi/strapi');

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function uploadImage(strapi, filePath, name) {
  const stat = fs.statSync(filePath);
  const [uploaded] = await strapi.plugin('upload').service('upload').upload({
    data: {},
    files: {
      filepath: filePath,
      originalFilename: name,
      mimetype: 'image/jpeg',
      size: stat.size,
    },
  });
  return uploaded;
}

const BLOG_POSTS = [
  {
    title: "The new Income Tax Act, 2025 — what's actually different",
    excerpt: 'Same tax, same rates, new section numbers, one renamed concept. What that actually looks like on a real return.',
    content: `Under the old Act, you earned income in a "Previous Year" and filed it in the following "Assessment Year" — two different years, one confusing habit. The new Act collapses this into a single "Tax Year": the same 1 April–31 March period, one name.

Anything you earned before 1 April 2026 is still governed by the old 1961 Act, filed the old way. Your FY 2025-26 return, filed in 2026, is untouched by any of this.

Worked example — a salaried professional: Say Priya earns ₹12,00,000 a year and claims ₹75,000 standard deduction, ₹1,50,000 under Section 80C, and ₹25,000 under Section 80D. Filing for FY 2025-26 (done in 2026) is governed by the 1961 Act — she claims Sections 80C and 80D exactly as before. Filing for Tax Year 2026-27 (done in 2027) is governed by the 2025 Act: the same deductions exist, worth the same amounts — they're just renumbered. Section 80C becomes Section 123 (read with Schedule XV), and Section 80D becomes Section 126. Her taxable income and tax payable are unchanged; only the section numbers her filing software auto-fills are different.

Worked example — a small business owner: Say Arjun runs a small trading business with an annual turnover of ₹1.8 crore, has never opted into presumptive taxation, and reports actual profit around 4% of turnover — below the 6–8% rate the law treats as a reasonable minimum. Under the old Act, this never triggered a mandatory audit by itself. Under the new Act, Section 63 (successor to Section 44AB) adds a genuinely new trigger: any business eligible for presumptive taxation under Section 58 that declares profit below the deemed rate now requires an audit, whether or not it ever opted into that scheme. From Tax Year 2026-27, Arjun may need an audit he's never needed before — purely because of the profit percentage on his own books.

Section 123, Section 126, and Section 63 are well-corroborated across multiple independent tax-practice sources and align with the Income Tax Department's own section-mapping references. The audit-trigger shift under Section 63 is a newer, more actively-discussed reading of the Act — worth confirming against final CBDT guidance as it's issued.`,
    tags: 'Tax',
  },
  {
    title: 'Old regime vs. new regime — how to actually decide',
    excerpt: "It's not about which is \"better\" — it's about which fits your actual deductions.",
    content: `Nothing changed this year, but the maths did last year — and most people haven't re-checked it. For FY 2025-26 (the return due 31 July 2026), the new regime's tax-free threshold jumped to ₹12,00,000, thanks to a bigger rebate under Section 87A. Add the ₹75,000 standard deduction, and a salaried person can earn up to roughly ₹12,75,000 and pay zero tax under the new regime.

The old regime hasn't moved: its tax-free limit is still ₹5,00,000, its standard deduction is ₹50,000, and it still lets you claim deductions like Section 80C (₹1,50,000 cap), 80D (health insurance), HRA, and home loan interest — none of which the new regime allows. The new regime is the default; you have to actively choose the old one when filing.

Who this affects: salaried individuals filing their FY 2025-26 return by 31 July 2026. It matters most if you have real deductions to claim — an active home loan, HRA, or serious 80C/80D investments — because that's the only scenario where the old regime can still win.

What to do: add up your actual deductions — 80C investments, 80D premiums, HRA, home loan interest, and anything else you'd genuinely claim. As a rough rule, if that total is under roughly ₹3,75,000–₹4,25,000, the new regime almost certainly saves you more. If it's well above that, run both numbers before filing — don't assume either regime wins by default.

If you have salary income only, you choose your regime directly on the ITR form each year. If you have business or professional income and want the old regime, you need to file Form 10-IEA before your return's due date — miss that, and you're locked into the new regime for the year.`,
    tags: 'Tax',
  },
  {
    title: "The new 'Tax Year' — why the old confusion is gone",
    excerpt: 'Previous year and assessment year merge into one clear label.',
    content: `Under the old system, every taxpayer had to juggle two different years for the same income: the "Previous Year," when you actually earned the money, and the "Assessment Year," the following year, when you filed and it got assessed. It tripped up almost everyone new to filing, and it wasn't even that useful — the two years always ran exactly one apart.

From 1 April 2026, the Income Tax Act, 2025 replaces both terms with a single concept: the Tax Year. It's the same 1 April–31 March period you already know — just one name instead of two. If you earn income between 1 April 2026 and 31 March 2027, that's simply Tax Year 2026-27. There's no new filing deadline hidden in this, no new year-count to track.

Who this affects: everyone filing a return for income earned from 1 April 2026 onward. It does not touch your return for FY 2025-26 (filed by 31 July 2026), which is still governed by the old Act and still uses "Previous Year" and "Assessment Year" as before.

What to do: nothing to prepare for right now — this is a naming change, not a compliance task. From April 2026, if your bank, employer, or accounting software still shows "Assessment Year" on a form for income earned after that date, it just hasn't updated its terminology yet.`,
    tags: 'Tax',
  },
  {
    title: 'You might be owed a bigger HRA deduction',
    excerpt: "The 50% exemption city list just grew from 4 to 8 — if you're in Bengaluru, Pune, Hyderabad or Ahmedabad, you were probably still claiming the smaller amount.",
    content: `HRA exemption has always used the lowest of three amounts, and one of those three depended on which city you live in: 50% of salary in the four original metros (Delhi, Mumbai, Kolkata, Chennai), or 40% everywhere else. From 1 April 2026, that list has grown to eight cities — Bengaluru, Pune, Hyderabad, and Ahmedabad now also qualify for the 50% rate, under the new Income Tax Rules, 2026.

This only helps if that "50%/40% of salary" limb was actually the smallest of the three in your case — which usually happens when your rent is high relative to your salary. If your exemption was already capped by actual rent paid or actual HRA received, the city upgrade won't change your number. And it applies only if you're on the old tax regime; the new regime doesn't allow HRA exemption at all, regardless of city.

Who this affects: salaried employees living in Bengaluru, Pune, Hyderabad, or Ahmedabad who are on the old tax regime and pay rent that's high relative to their basic salary. It does not help residents of Gurgaon, Noida, or Surat — despite being major employment hubs, none of them made the expanded list.

What to do: get the timing right. This applies only to income earned from 1 April 2026 onward. If you're filing your FY 2025-26 return (due 31 July 2026), you're still bound by the old 4-city rule. Also check with your employer's payroll from your April 2026 salary onward — many payroll systems haven't yet been updated to apply the new rate automatically.`,
    tags: 'Tax',
  },
  {
    title: "Form 16 has a new name — here's what changed on your salary slip",
    excerpt: "It's now called Form 130. The number changed; what it means for you mostly didn't.",
    content: `Form 16 — the annual TDS certificate your employer gives you, showing your salary, deductions, and tax deducted — has been renumbered to Form 130 under the Income Tax Act, 2025 and the Income Tax Rules, 2026. It still does the same job: it's still generated after your employer files quarterly TDS returns, and you'll still use it to file your return.

It's not purely a rename, though. Form 130 adds a third section that consolidates your salary, exemptions, deductions, and final tax calculation into one place, instead of spreading it across separate pages. It also swaps "Assessment Year" for "Tax Year" throughout, and references the new Section 392 in place of the old Section 192.

Who this affects: every salaried individual — but not immediately. Form 16 remains valid and is still what your employer issues for FY 2025-26, due by 15 June 2026. Form 130 only becomes mandatory for Tax Year 2026-27, meaning you'd actually receive your first Form 130 by around 15 June 2027.

What to do: nothing right now — you likely already have your Form 16 for this year, and it's still the correct document to file with. From your April 2026 salary onward, keep an eye on your payslips for the new terminology (Form 130, Section 392, "Tax Year") so it doesn't look unfamiliar when it starts appearing.`,
    tags: 'Tax',
  },
  {
    title: '₹12 lakh, zero tax — how the new regime rebate actually works',
    excerpt: 'The Section 87A rebate explained in real numbers, not slab tables.',
    content: `For FY 2025-26 (the return due 31 July 2026), the Section 87A rebate under the new tax regime rose to ₹60,000, up from ₹25,000 the year before. That single number is why income up to ₹12,00,000 now results in zero tax — not because that income isn't taxed, but because the rebate cancels out the tax calculated on it.

Here's how it works, with numbers. Say your taxable income is ₹12,00,000. Run it through the new regime's slabs and you get a tax of roughly ₹60,000 before cess. Since your income doesn't exceed ₹12,00,000, Section 87A lets you claim a rebate up to ₹60,000 — which exactly cancels that tax. Net payable: zero. If you're salaried, add the ₹75,000 standard deduction on top, and a gross salary of about ₹12,75,000 can still land you at zero tax.

Who this affects: salaried individuals with gross income up to roughly ₹12,75,000 who've opted for (or are considering) the new regime. Tax is still calculated on your full income; the rebate is what wipes it out afterward, and only up to the ₹60,000 cap.

What to do: know exactly where the edge is. The rebate applies only if your taxable income doesn't exceed ₹12,00,000 — cross that line by even a little, and you don't just pay tax on the excess, you lose the rebate on the whole amount too (marginal relief softens this, but it's still worth avoiding by design). Also note: the rebate doesn't apply to income taxed at special rates, like capital gains, so if you have those alongside salary, don't assume your whole income is covered.`,
    tags: 'Tax',
  },
  {
    title: 'Retired, or supporting retired parents? The TDS change explained',
    excerpt: 'A higher interest threshold and one merged form — what it means for pension and FD income.',
    content: `Two separate changes have landed close together. First: the TDS-free threshold on bank and post office interest was raised for FY 2025-26 onward — to ₹50,000 for everyone, and ₹1,00,000 for senior citizens (60 and above), up from ₹40,000 and ₹50,000 respectively. Banks only start deducting TDS once a senior citizen's total interest from that bank crosses ₹1,00,000 in a year.

Second: from 1 April 2026, the separate Form 15G (for those under 60) and Form 15H (for senior citizens) are merged into a single Form 121 under the new Income Tax Rules, 2026. Worth knowing: Form 15H had a quirk that let senior citizens with gross income above the exemption limit still submit it, as long as deductions brought net tax to zero. Early guidance suggests Form 121 may not carry that flexibility forward — so it's worth double-checking eligibility rather than assuming the old logic still applies.

Who this affects: senior citizens with fixed deposits, recurring deposits, or other bank/post office interest income, and anyone managing a retired parent's bank paperwork on their behalf.

What to do: check the actual interest earned across all FDs at each bank — the ₹1,00,000 threshold applies per bank, not in aggregate, so spreading deposits across two or three banks can genuinely keep you under the limit at each one. If total taxable income is below the exemption limit, submit the new Form 121 once your bank has it available. If TDS is still deducted despite low income, file a return to claim it back as a refund.`,
    tags: 'Tax',
  },
  {
    title: 'Returning to India? Foreign asset disclosure just got harder to skip',
    excerpt: "The rule hasn't changed — but the department can now see your foreign accounts directly.",
    content: `Foreign asset disclosure — Schedule FA in your ITR — has always applied only to individuals classified as Resident and Ordinarily Resident (ROR). If you're genuinely non-resident, this doesn't touch you. It also doesn't touch you during your RNOR window — the 2–3 years after moving back to India when you're a resident for tax purposes but not yet "ordinarily" resident.

What's new: from July 2026, the tax department has started feeding AEOI data — foreign bank and account details shared automatically by over 100 countries under CRS and FATCA — directly into your AIS (Annual Information Statement). The disclosure requirement itself is unchanged. What's changed is detection: mismatches between your declared assets and what foreign tax authorities report now surface automatically, rather than depending on manual scrutiny.

Who this affects: returning NRIs who've crossed from RNOR into ROR status, and any Indian resident holding a foreign bank account, brokerage account, RSUs, or overseas property.

What to do: if you're ROR and hold foreign assets, foreign bank accounts, or overseas equity (including vested RSUs), disclose them in Schedule FA — even if they earned zero income during the year. It runs on the calendar year (1 January–31 December), not the Indian financial year, which trips up a lot of filers. Non-disclosure carries a flat ₹10,00,000 penalty per year under the Black Money Act, with a ₹20,00,000 safe-harbour exemption for small movable-asset holdings. If you've missed a past year's disclosure, a revised or updated return, filed proactively, is a materially better position than waiting for a notice.`,
    tags: 'Tax',
  },
  {
    title: 'GST 2.0 — the new slab structure, plain and simple',
    excerpt: 'Rationalized slabs mean your pricing and invoicing may need a second look.',
    content: `GST rates have been rationalized into a simpler slab structure. Some goods and services moved slabs entirely — which means your pricing, invoicing and input credit calculations may need a second look.

Who this affects: any business selling goods or services, and startups still setting their pricing.

What to do: check your HSN/SAC codes against the new slabs. Update invoice templates and price lists that reference the old rate. Reprice anything whose rate has actually changed — don't assume it hasn't.`,
    tags: 'GST',
  },
  {
    title: 'New GST compliance rules — why your returns can get "blocked"',
    excerpt: "A vendor's non-compliance can now block your own return.",
    content: `Enforcement has tightened: your return filing can now be blocked by mismatches or a vendor's non-compliance upstream, not just your own errors. It's no longer purely a self-contained process.

Who this affects: businesses filing regular GST returns, especially ones with a lot of vendors or a complex supply chain.

What to do: reconcile input credit against vendor filings every month, not just at year-end. Flag mismatches early — don't wait for a blocked return to notice them. Talk to us if a vendor's filing history is starting to look unreliable.`,
    tags: 'GST',
  },
  {
    title: "E-invoicing threshold changes — who's newly required",
    excerpt: 'The turnover threshold moved — more businesses are in scope than expect.',
    content: `The turnover threshold that triggers mandatory e-invoicing has moved, pulling in more small and mid-sized businesses than before — often ones that didn't expect to be in scope yet.

Who this affects: growing businesses approaching the threshold, and startups scaling revenue faster than their compliance setup.

What to do: check your trailing turnover against the current threshold, not last year's. Set up e-invoicing before you cross it, not after. Talk to us if you're not sure whether you're already required to comply.`,
    tags: 'GST',
  },
];

async function main() {
  const app = await createStrapi({
    appDir: __dirname + '/..',
    distDir: __dirname + '/../dist',
  }).load();

  try {
    console.log('Removing placeholder blog posts...');
    const oldPosts = await app.documents('api::blog-post.blog-post').findMany({ limit: 100 });
    for (const p of oldPosts) {
      await app.documents('api::blog-post.blog-post').delete({ documentId: p.documentId });
    }

    console.log('Removing placeholder testimonials...');
    const oldTestimonials = await app.documents('api::testimonial.testimonial').findMany({ limit: 100 });
    for (const t of oldTestimonials) {
      await app.documents('api::testimonial.testimonial').delete({ documentId: t.documentId });
    }

    console.log('Creating real blog posts...');
    const today = new Date().toISOString().slice(0, 10);
    for (const post of BLOG_POSTS) {
      await app.documents('api::blog-post.blog-post').create({
        data: {
          title: post.title,
          slug: slugify(post.title),
          excerpt: post.excerpt,
          content: post.content,
          publishedDate: today,
          author: 'CA Rajni Goswami',
        },
        status: 'published',
      });
    }

    console.log('Updating site settings with real info...');
    const existingSettings = await app.documents('api::site-setting.site-setting').findFirst({ populate: ['photo'] });

    if (existingSettings && existingSettings.photo) {
      await app.plugin('upload').service('upload').remove(existingSettings.photo);
    }

    console.log('Uploading portrait photo...');
    const portraitPath = path.join(__dirname, 'seed-assets', 'rajni-portrait.jpg');
    const uploadedPhoto = fs.existsSync(portraitPath)
      ? await uploadImage(app, portraitPath, 'rajni-portrait.jpg')
      : null;

    const settingsData = {
      businessName: 'Rajni Goswami, Chartered Accountant',
      tagline: "Take control of your money, with the help of someone who's been doing this for 3 decades.",
      bio: "I started this practice to make finances feel less intimidating — whether you're a salaried professional filing returns, a growing business managing GST, or a startup figuring out compliance for the first time. My approach stays simple to understand but robust enough to hold up under scrutiny. And when the rules change, I'd rather explain it to you than let you find out the hard way.",
      email: 'rajnigoswamica@gmail.com',
      phone: '+91 79829 12539',
      whatsappNumber: '+91 79829 12539',
      address: 'New Delhi, NCR',
      credentials: 'Chartered Accountant (ICAI)',
      yearsExperience: 30,
      linkedinUrl: '',
      ...(uploadedPhoto ? { photo: uploadedPhoto.id } : {}),
    };

    if (existingSettings) {
      await app.documents('api::site-setting.site-setting').update({
        documentId: existingSettings.documentId,
        data: settingsData,
        status: 'published',
      });
    } else {
      await app.documents('api::site-setting.site-setting').create({
        data: settingsData,
        status: 'published',
      });
    }

    console.log('Done.');
  } finally {
    await app.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
