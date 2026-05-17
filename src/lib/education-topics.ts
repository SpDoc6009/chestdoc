export const educationTopicOptions = [
  { value: "disease", label: "認識疾病", keyword: "認識疾病" },
  { value: "exam", label: "檢查前後", keyword: "檢查" },
  { value: "treatment", label: "藥物與治療", keyword: "治療" },
  { value: "home-care", label: "居家照護", keyword: "居家照護" }
] as const;

export type EducationTopicValue = (typeof educationTopicOptions)[number]["value"];

export const educationTopicKeywords: readonly string[] = educationTopicOptions.map((topic) => topic.keyword);

export function getEducationTopicKeyword(value: string) {
  return educationTopicOptions.find((topic) => topic.value === value)?.keyword;
}

export function getEducationTopicValueFromKeywords(keywords: string[]) {
  return educationTopicOptions.find((topic) => keywords.includes(topic.keyword))?.value ?? "";
}
