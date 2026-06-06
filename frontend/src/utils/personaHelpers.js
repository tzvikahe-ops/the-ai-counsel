/**
 * Returns a display-time localized copy of a persona.
 *
 * Strategy: if the persona's id has a translation under `personas.<id>`
 * AND the persona has not been customized by the user, swap in the
 * localized name / role / description. Otherwise we trust whatever the
 * backend (or the user's own customization) returned.
 *
 * The persona's system_prompt is intentionally NOT translated — model
 * instructions stay in English regardless of UI language.
 */
export function localizePersona(persona, t) {
  if (!persona || !t) return persona;
  if (persona.is_customized) return persona;

  const key = `personas.${persona.id}`;
  const localizedName = t(`${key}.name`, { defaultValue: persona.name });
  const localizedRole = t(`${key}.role`, { defaultValue: persona.role });
  const localizedDesc = t(`${key}.description`, { defaultValue: persona.description });

  return {
    ...persona,
    name: localizedName,
    role: localizedRole,
    description: localizedDesc,
  };
}
