import moment from "moment";

export function normalizeBandejaDate(value) {
  if (value === null || value === undefined) return "";

  const raw = String(value).trim();
  if (!raw) return "";

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }

  const latam = moment(raw, ["DD/MM/YYYY", "DD-MM-YYYY"], true);
  if (latam.isValid()) {
    return latam.format("YYYY-MM-DD");
  }

  const isoMoment = moment(raw, moment.ISO_8601, true);
  if (isoMoment.isValid()) {
    return isoMoment.format("YYYY-MM-DD");
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return moment(parsed).format("YYYY-MM-DD");
  }

  return "";
}

export function formatBandejaShortDate(value) {
  return normalizeBandejaDate(value) || "";
}

function resolveComparableTime(value) {
  if (value === null || value === undefined) return Number.NaN;

  const isoMoment = moment(String(value).trim(), moment.ISO_8601, true);
  if (isoMoment.isValid()) {
    return isoMoment.valueOf();
  }

  const parsed = new Date(String(value).trim());
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getTime();
  }

  return Number.NaN;
}

export function sortBandejaItems(items = [], getDate = (item) => item?.fecha) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const dateValue = getDate(item);
      return {
        item,
        index,
        dayKey: normalizeBandejaDate(dateValue),
        timeValue: resolveComparableTime(dateValue),
      };
    })
    .sort((left, right) => {
      if (left.dayKey && right.dayKey && left.dayKey !== right.dayKey) {
        return left.dayKey.localeCompare(right.dayKey);
      }

      if (!Number.isNaN(left.timeValue) && !Number.isNaN(right.timeValue) && left.timeValue !== right.timeValue) {
        return left.timeValue - right.timeValue;
      }

      // Fallback: la fuente suele venir en orden inverso de recepción.
      return right.index - left.index;
    })
    .map((entry) => entry.item);
}

export function groupBandejaItemsByDay(items = [], getDate = (item) => item?.fecha) {
  const sorted = sortBandejaItems(items, getDate);
  const groups = [];

  sorted.forEach((item) => {
    const dayKey = normalizeBandejaDate(getDate(item)) || "Sin fecha";
    const lastGroup = groups[groups.length - 1];

    if (!lastGroup || lastGroup.dayKey !== dayKey) {
      groups.push({
        dayKey,
        dayLabel: dayKey,
        items: [item],
      });
      return;
    }

    lastGroup.items.push(item);
  });

  return groups;
}