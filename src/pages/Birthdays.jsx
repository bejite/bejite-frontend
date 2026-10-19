import React from "react";
import NewsFeedLayout from "../components/layout/NewsFeedLayout";
import BirthdaysMiddle from "../components/birthdays/BirthdaysMiddle";

export default function Birthdays() {
  return (
    <NewsFeedLayout showSidebars={true}>
      <BirthdaysMiddle />
    </NewsFeedLayout>
  );
}
