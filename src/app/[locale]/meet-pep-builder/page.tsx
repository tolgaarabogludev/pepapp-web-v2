

import type { Metadata } from "next";

import { MeetPepBuilder } from "./MeetPepBuilder";

export const metadata: Metadata = {
  title: "Meet Pep Builder",
};

export default function MeetPepBuilderPage() {
  return <MeetPepBuilder />;
}