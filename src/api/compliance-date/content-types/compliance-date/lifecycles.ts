import { errors } from '@strapi/utils';

/**
 * `tags` is a JSON field, so Strapi cannot enforce its shape. The website
 * filters panels by these exact strings, so reject anything else up front —
 * a typo here would silently drop a date from every page.
 */
export const COMPLIANCE_TAGS = ['income-tax', 'audit', 'advance-tax', 'tds', 'gst'] as const;

function assertTags(tags: unknown) {
  if (tags === undefined || tags === null) return;
  const ok =
    Array.isArray(tags) &&
    tags.every((t) => typeof t === 'string' && (COMPLIANCE_TAGS as readonly string[]).includes(t));
  if (!ok) {
    throw new errors.ValidationError(
      `tags must be an array of: ${COMPLIANCE_TAGS.join(', ')}`
    );
  }
}

export default {
  beforeCreate(event: { params: { data: { tags?: unknown } } }) {
    assertTags(event.params.data?.tags);
  },
  beforeUpdate(event: { params: { data: { tags?: unknown } } }) {
    assertTags(event.params.data?.tags);
  },
};
