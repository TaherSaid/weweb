const SAMPLE_DATA = [
  {
    id: "fb8bb444-49f2-44ac-9ade-cf009cb813f3",
    name: "Refonte plateforme",
    expectedStartDate: "2026-05-29",
    expectedEndDate: "2026-07-02",
    type: "dev",
    status: "a_planifier",
    teamAllocations: [
      { id: "057349f6", totalDays: 20, team: { id: "000b80df", name: "Design", code: "design" } },
      { id: "bc2a78a4", totalDays: 10, team: { id: "5bbba80c", name: "Data", code: "data" } },
      { id: "e86f4906", totalDays: 40, team: { id: "529e3199", name: "DEV", code: "dev" } },
    ],
  },
  {
    id: "5fce121e-1c83-4e0b-a5ef-900e65576a5d",
    name: "Migration data",
    expectedStartDate: "2026-05-02",
    expectedEndDate: "2026-07-02",
    type: "dev",
    status: "en_cours",
    teamAllocations: [],
  },
  {
    id: "bcc9dbae-869a-4751-9027-a33c76e36383",
    name: "Test recette",
    expectedStartDate: "2026-06-02",
    expectedEndDate: "2026-06-29",
    type: "dev",
    status: "cloture",
    teamAllocations: [],
  },
  {
    id: "e884e980-b8df-4f3c-9c90-43b21f06eb47",
    name: "Nouvelle opportunité",
    expectedStartDate: "2026-05-25",
    expectedEndDate: "2026-05-31",
    type: "dev",
    status: "en_attente_go_client",
    teamAllocations: [
      { id: "448ed318", totalDays: 1, team: { id: "5bbba80c", name: "Data", code: "data" } },
      { id: "a0de531e", totalDays: 20, team: { id: "000b80df", name: "Design", code: "design" } },
      { id: "9302f328", totalDays: 30, team: { id: "529e3199", name: "DEV", code: "dev" } },
    ],
  },
  {
    id: "a181866b-78d1-4eb7-a734-5f0382f609ac",
    name: "Projet BI",
    expectedStartDate: "2026-05-25",
    expectedEndDate: "2026-06-07",
    type: "dev",
    status: "recette_po",
    teamAllocations: [
      { id: "899bf085", totalDays: 10, team: { id: "000b80df", name: "Design", code: "design" } },
      { id: "5e25e501", totalDays: 50, team: { id: "5bbba80c", name: "Data", code: "data" } },
      { id: "582ed757", totalDays: 30, team: { id: "9ff1c7c6", name: "BI", code: "bi" } },
    ],
  },
];

export default {
  editor: {
    label: {
      en: "Gantt Chart",
    },
  },
  properties: {
    data: {
      label: {
        en: "Data (projects array)",
      },
      bindable: true,
      defaultValue: SAMPLE_DATA,
      /* wwEditor:start */
      bindingValidation: {
        type: "array",
        tooltip:
          "Bind an array of projects (id, name, expectedStartDate, expectedEndDate, status, teamAllocations[]). Leave the API URL empty to use this.",
      },
      /* wwEditor:end */
    },
    apiUrl: {
      label: {
        en: "API URL (optional)",
      },
      type: "Text",
      bindable: true,
      defaultValue: "",
      /* wwEditor:start */
      bindingValidation: {
        type: "string",
        tooltip:
          "Optional REST endpoint returning the projects array (GET). When set, it overrides the Data property.",
      },
      /* wwEditor:end */
    },
    dataPath: {
      label: {
        en: "Data path in API response",
      },
      type: "Text",
      defaultValue: "",
      /* wwEditor:start */
      bindingValidation: {
        type: "string",
        tooltip:
          "Dot path to the array inside the API response, e.g. \"data\" or \"result.items\". Leave empty if the response is already an array.",
      },
      /* wwEditor:end */
    },
    minMonthWidth: {
      label: {
        en: "Min month width (px)",
      },
      type: "Number",
      defaultValue: 90,
    },
  },
};
