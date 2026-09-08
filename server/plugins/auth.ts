import { createAuthPlugin } from "@agent-native/core/server";

const rawAppTitle = "{{APP_TITLE}}";
const appTitle =
  rawAppTitle === "{" + "{APP_TITLE}}" ? "RakitApp" : rawAppTitle;

export default createAuthPlugin({
  workspaceAppAudience: "public",
  workspaceAppPublicPaths: ["/prototype", "/admin"],
  workspaceAppProtectedPaths: [
    "/agent",
    "/chat",
    "/database",
    "/extensions",
    "/observability",
    "/settings",
    "/team",
    "/my-prototypes",
  ],
  publicPaths: [
    "/_agent-native/actions/calculate-project-estimate",
    "/_agent-native/actions/generate-project-brief",
    "/_agent-native/actions/get-prototype-trial",
    "/_agent-native/actions/get-public-activity",
    "/_agent-native/actions/list-catalog-apps",
    "/_agent-native/actions/start-prototype-trial",
    "/_agent-native/actions/submit-consultation",
  ],
  marketing: {
    appName: appTitle,
    tagline: "Ubah ide pembelajaran menjadi aplikasi yang siap dirancang.",
    features: [
      "Rancang kebutuhan aplikasi pendidikan tanpa memahami coding",
      "Dapatkan brief, kisaran biaya, dan estimasi durasi yang jelas",
      "Hubungkan agent dan tim untuk melanjutkan proses konsultasi",
    ],
  },
});
