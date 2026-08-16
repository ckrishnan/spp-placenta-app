// Reference data based on Pinar, H. et al. "Reference values for singleton and twin placenta weights." (2012).
// And supplemented by user-provided data for singleton placentas.

type PercentileData = {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
};

// Data in grams for singleton placentas by gestational age (weeks)
const singletonWeights: Record<number, PercentileData> = {
  21: { p10: 114, p25: 128, p50: 143, p75: 158, p90: 172 },
  22: { p10: 122, p25: 138, p50: 157, p75: 175, p90: 191 },
  23: { p10: 133, p25: 151, p50: 172, p75: 193, p90: 211 },
  24: { p10: 145, p25: 166, p50: 189, p75: 212, p90: 233 },
  25: { p10: 159, p25: 182, p50: 208, p75: 233, p90: 256 },
  26: { p10: 175, p25: 200, p50: 227, p75: 255, p90: 280 },
  27: { p10: 192, p25: 219, p50: 248, p75: 278, p90: 305 },
  28: { p10: 210, p25: 238, p50: 270, p75: 302, p90: 331 },
  29: { p10: 249, p25: 259, p50: 293, p75: 327, p90: 357 },
  30: { p10: 249, p25: 281, p50: 316, p75: 352, p90: 384 },
  31: { p10: 269, p25: 303, p50: 340, p75: 377, p90: 411 },
  32: { p10: 290, p25: 325, p50: 364, p75: 403, p90: 438 },
  33: { p10: 311, p25: 347, p50: 387, p75: 428, p90: 464 },
  34: { p10: 331, p25: 369, p50: 411, p75: 453, p90: 491 },
  35: { p10: 352, p25: 391, p50: 434, p75: 477, p90: 516 },
  36: { p10: 372, p25: 412, p50: 457, p75: 501, p90: 542 },
  37: { p10: 391, p25: 432, p50: 478, p75: 524, p90: 566 },
  38: { p10: 409, p25: 452, p50: 499, p75: 547, p90: 589 },
  39: { p10: 426, p25: 470, p50: 519, p75: 567, p90: 611 },
  40: { p10: 442, p25: 487, p50: 537, p75: 587, p90: 632 },
  41: { p10: 456, p25: 502, p50: 553, p75: 605, p90: 651 },
  42: { p10: 468, p25: 515, p50: 568, p75: 621, p90: 668 },
  43: { p10: 478, p25: 526, p50: 580, p75: 634, p90: 682 },
  44: { p10: 486, p25: 535, p50: 590, p75: 645, p90: 694 },
  45: { p10: 492, p25: 542, p50: 598, p75: 654, p90: 704 },
};

// Data in grams for twin placentas (combined weight)
const twinWeights: Record<number, PercentileData> = {
  19: { p10: 161, p25: 185, p50: 212, p75: 239, p90: 263 },
  20: { p10: 166, p25: 190, p50: 218, p75: 245, p90: 270 },
  21: { p10: 176, p25: 202, p50: 231, p75: 260, p90: 286 },
  22: { p10: 191, p25: 219, p50: 251, p75: 282, p90: 310 },
  23: { p10: 210, p25: 241, p50: 276, p75: 311, p90: 343 },
  24: { p10: 232, p25: 267, p50: 307, p75: 346, p90: 382 },
  25: { p10: 257, p25: 297, p50: 341, p75: 386, p90: 426 },
  26: { p10: 284, p25: 330, p50: 380, p75: 430, p90: 475 },
  27: { p10: 314, p25: 365, p50: 421, p75: 478, p90: 528 },
  28: { p10: 345, p25: 401, p50: 464, p75: 527, p90: 584 },
  29: { p10: 377, p25: 439, p50: 509, p75: 579, p90: 641 },
  30: { p10: 409, p25: 478, p50: 554, p75: 631, p90: 700 },
  31: { p10: 441, p25: 516, p50: 600, p75: 683, p90: 758 },
  32: { p10: 472, p25: 554, p50: 644, p75: 734, p90: 815 },
  33: { p10: 503, p25: 590, p50: 687, p75: 783, p90: 870 },
  34: { p10: 531, p25: 624, p50: 727, p75: 830, p90: 923 },
  35: { p10: 556, p25: 656, p50: 764, p75: 873, p90: 971 },
  36: { p10: 582, p25: 684, p50: 798, p75: 912, p90: 1014 },
  37: { p10: 602, p25: 708, p50: 827, p75: 945, p90: 1051 },
  38: { p10: 619, p25: 728, p50: 850, p75: 972, p90: 1082 },
  39: { p10: 631, p25: 743, p50: 868, p75: 993, p90: 1105 },
  40: { p10: 639, p25: 753, p50: 879, p75: 1005, p90: 1118 },
  41: { p10: 642, p25: 756, p50: 882, p75: 1009, p90: 1123 },
  42: { p10: 645, p25: 759, p50: 885, p75: 1012, p90: 1126 },
  43: { p10: 647, p25: 761, p50: 887, p75: 1014, p90: 1128 },
  44: { p10: 648, p25: 762, p50: 888, p75: 1015, p90: 1129 },
  45: { p10: 649, p25: 763, p50: 889, p75: 1016, p90: 1130 },
};


const getReferenceData = (
  weeks: number,
  table: Record<number, PercentileData>
): PercentileData | null => {
  const roundedWeeks = Math.round(weeks);
  return table[roundedWeeks] || null;
};

export const calculatePercentileRank = (
  weight: number,
  weeks: number,
  birthType: "singleton" | "twin" | "triplet"
): string | null => {
  if (!weight || !weeks) return null;

  let table;
  if (birthType === "singleton") {
    table = singletonWeights;
  } else if (birthType === "twin") {
    table = twinWeights;
  } else {
    // No reference data for triplets in this simplified model
    return null;
  }

  const refData = getReferenceData(weeks, table);
  if (!refData) return "N/A";

  if (weight < refData.p10) return "<10th";
  if (weight < refData.p25) return "10th-25th";
  if (weight < refData.p50) return "25th-50th";
  if (weight < refData.p75) return "50th-75th";
  if (weight < refData.p90) return "75th-90th";
  return ">90th";
};
