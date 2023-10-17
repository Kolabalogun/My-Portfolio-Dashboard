import React from "react";

import InfoCard from "../components/Cards/InfoCard";
import { Card, CardBody } from "@windmill/react-ui";
import PageTitle from "../components/Typography/PageTitle";
import { MoneyIcon, PeopleIcon } from "../icons";
import RoundIcon from "../components/RoundIcon";
import SectionTitle from "../components/Typography/SectionTitle";
import CTA from "../components/CTA";
import { Button } from "@windmill/react-ui";
import { useGlobalContext } from "../context/GlobalContext";
import ThemedSuspense from "../components/ThemedSuspense";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

function Dashboard() {
  const { projectsFromDB, projectsFromDBLoader, viewsCount } = useGlobalContext();

  function getFormattedDate() {
    const options = {
      weekday: "short", // Short weekday name (e.g., "Mon", "Tue", etc.)
      day: "numeric", // Numeric day of the month (e.g., 1, 2, etc.)
      month: "short", // Short month name (e.g., "Jan", "Feb", etc.)
      year: "numeric", // Full year (e.g., 2022)
      hour: "numeric", // Numeric hour (e.g., 1, 2, etc.)
      minute: "numeric", // Numeric minute (e.g., 30, 45, etc.)
      hour12: true, // Use 12-hour clock format (true) or 24-hour clock format (false)
    };

    const date = new Date();
    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
      date
    );

    return formattedDate;
  }

  const formattedDate = getFormattedDate();
  console.log(formattedDate); // Output: "Thu, 23 May, 2022, 4:45 PM" (format may vary depending on the locale)

  if (projectsFromDBLoader) {
    return <ThemedSuspense />;
  }

  return (
    <>
      <PageTitle>Dashboard</PageTitle>

      <CTA />

      {/* <!-- Cards --> */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 ">
        <InfoCard title="Total Projects" value={projectsFromDB?.length}>
          <RoundIcon
            icon={MoneyIcon}
            iconColorClass="text-green-500 dark:text-green-100"
            bgColorClass="bg-green-100 dark:bg-green-500"
            className="mr-4"
          />
        </InfoCard>
        <InfoCard title="Page View" value={viewsCount?.count}>
          <RoundIcon
            icon={PeopleIcon}
            iconColorClass="text-orange-500 dark:text-orange-100"
            bgColorClass="bg-orange-100 dark:bg-orange-500"
            className="mr-4"
          />
        </InfoCard>
      </div>

      <SectionTitle>Your Projects</SectionTitle>

      <div className="">
        <Card>
          <CardBody>
            <p className="mb-4 font-semibold text-gray-600 dark:text-gray-300">
              Projects
            </p>
            <p className="text-gray-600 dark:text-gray-400 ">
              Here is your comprehensive and well-organized dashboard, you'll
              find an extensive list of projects, each elegantly displayed with
              their corresponding project names, links, creation dates, and
              brief descriptions, allowing you to effortlessly manage, review,
              and keep track of all your ongoing and completed projects in one
              centralized location.
            </p>
            <div className="mt-6">
              <Button tag={Link} to="/app/projects">
                See Projects
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

export default Dashboard;
