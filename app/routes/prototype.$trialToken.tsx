import { useParams } from "react-router";

// i18n-raw-literal-disable-file: RakitApp MVP copy is intentionally Indonesian.
import { PrototypePage } from "@/pages/PrototypePage";

export function meta() {
  return [{ title: "Prototype RakitApp — RakitApp" }];
}

export default function PrototypeRoute() {
  const { trialToken } = useParams();
  return <PrototypePage trialToken={trialToken ?? ""} />;
}
