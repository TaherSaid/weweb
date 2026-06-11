const SAMPLE_DATA = [
  {
    id: "fb8bb444-49f2-44ac-9ade-cf009cb813f3",
    name: "Refonte plateforme",
    description: "aeaeazezaezaea",
    comment: "azezeaeaeaeazeaeaeae",
    expectedStartDate: "2026-05-29",
    expectedEndDate: "2026-07-02",
    type: "dev",
    status: "a_planifier",
    teamAllocations: [
      { id: "057349f6", projectId: "fb8bb444", teamId: "000b80df", totalDays: 20, team: { id: "000b80df", name: "Design", code: "design" } },
      { id: "bc2a78a4", projectId: "fb8bb444", teamId: "5bbba80c", totalDays: 10, team: { id: "5bbba80c", name: "Data", code: "data" } },
      { id: "e86f4906", projectId: "fb8bb444", teamId: "529e3199", totalDays: 40, team: { id: "529e3199", name: "DEV", code: "dev" } },
    ],
  },
  {
    id: "5fce121e-1c83-4e0b-a5ef-900e65576a5d",
    name: "Migration data",
    description: "rzereiezrhjzehkh",
    comment: "eifojzeiurhrjriuzherj",
    expectedStartDate: "2026-05-02",
    expectedEndDate: "2026-07-02",
    type: "dev",
    status: "en_cours",
    teamAllocations: [],
  },
  {
    id: "bcc9dbae-869a-4751-9027-a33c76e36383",
    name: "Test recette",
    description: "fjid,ks,fkdfskfns",
    comment: "sdiogfnsdokflds,fksnf",
    expectedStartDate: "2026-06-02",
    expectedEndDate: "2026-06-29",
    type: "dev",
    status: "cloture",
    teamAllocations: [],
  },
  {
    id: "e884e980-b8df-4f3c-9c90-43b21f06eb47",
    name: "Nouvelle opportunité",
    description: "zriherherzh",
    comment: "rhezurhzeruhrz",
    expectedStartDate: "2026-05-25",
    expectedEndDate: "2026-05-31",
    type: "dev",
    status: "en_attente_go_client",
    teamAllocations: [
      { id: "448ed318", projectId: "e884e980", teamId: "5bbba80c", totalDays: 1, team: { id: "5bbba80c", name: "Data", code: "data" } },
      { id: "a0de531e", projectId: "e884e980", teamId: "000b80df", totalDays: 20, team: { id: "000b80df", name: "Design", code: "design" } },
      { id: "9302f328", projectId: "e884e980", teamId: "529e3199", totalDays: 30, team: { id: "529e3199", name: "DEV", code: "dev" } },
    ],
  },
  {
    id: "a181866b-78d1-4eb7-a734-5f0382f609ac",
    name: "Projet BI",
    description: "dsfdsfqsdf",
    comment: "sdfdsqfqdsfqdsfqsd",
    expectedStartDate: "2026-05-25",
    expectedEndDate: "2026-06-07",
    type: "dev",
    status: "recette_po",
    teamAllocations: [
      { id: "899bf085", projectId: "a181866b", teamId: "000b80df", totalDays: 10, team: { id: "000b80df", name: "Design", code: "design" } },
      { id: "5e25e501", projectId: "a181866b", teamId: "5bbba80c", totalDays: 50, team: { id: "5bbba80c", name: "Data", code: "data" } },
      { id: "582ed757", projectId: "a181866b", teamId: "9ff1c7c6", totalDays: 30, team: { id: "9ff1c7c6", name: "BI", code: "bi" } },
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
        tooltip: "Bind an array of project objects (id, name, expectedStartDate, expectedEndDate, status, teamAllocations[]).",
      },
      /* wwEditor:end */
    },
    monthWidth: {
      label: {
        en: "Month column width (px)",
      },
      type: "Number",
      defaultValue: 90,
    },
  },
};
