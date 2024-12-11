import { data } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import "../css/index.css";
import SideBar from "./components/SideBar/sidebar.jsx";
import DisplayDirectory from "./components/DisplayDirectory/displayDirectory.jsx";
import { prisma } from "../utils/prisma.server.js";

const searchIcon = "../assets/search.svg";

export async function loader() {
  const hierarchy = await prisma.hierarchy.findMany();
  const metadata = await prisma.metadata.findMany();
  return data(hierarchy, metadata);
}

export default function Index() {
  const hierarchy = useLoaderData();
  const metadata = useLoaderData();

  // need to move state management for nodes here.
  const [currentNodeId, setCurrentNodeId] = useState(null);

  const DisplayDirectoryProps = {
    metadata: metadata,
    hierarchy: hierarchy,
    currentNodeId: currentNodeId,
    setCurrentNodeId, setCurrentNodeId
  }
  return (
    <>
      <SideBar />
      <div className="main">
        <div className="searchbarwrapper flex-jc-ai  main-bg">
          <button className="submitButton">
            <img className="searchIcon" src={searchIcon} alt="search icon" />
          </button>
          <input
            className="searchBar"
            id="searchbar"
            type="text"
            placeholder="Search drive"
          />
        </div>
        <div className="mainWindow main-bg">
          <DisplayDirectory {...DisplayDirectoryProps} />
        </div>
      </div>
    </>
  );
}
