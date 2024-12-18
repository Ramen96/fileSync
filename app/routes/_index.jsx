import { data } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import "../css/index.css";
import SideBar from "./components/SideBar/sidebar.jsx";
import DisplayDirectory from "./components/DisplayDirectory/displayDirectory.jsx";
import { prisma } from "../utils/prisma.server.js";
const searchIcon = "../assets/search.svg";


export async function loader() {
  // Had weird error where prisma would throw an error "cannot read properties of undefined"
  // see docs https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/null-and-undefined scroll to section that talks about findMany()
  // see example
  
  // Example: 
  //   const metadata = await prisma.metadata.findMany({
  //     where: {
  //       id: undefined/null here
  //     }
  //   });
      
  // For some reason after calling findMany how it is in the example above it worked both ways
  try {
    const metadata = await prisma.metadata.findMany(); // This is the same as setting id to undefined 
    const hierarchy = await prisma.hierarchy.findMany(); // Note: When I did this both tables were compleatly empty, may or may not be the reason for this weird behavior.
    const root = await prisma.hierarchy.findMany({
      where: {
        parent_id: null
      }
    });
    return data({ metadata, hierarchy, root });
  } catch (error) {
    console.error("Error fetching data:", error);
    return data({metadata: [], hierarchy: [],  root: [] }, { status: 500 });
  }
}

export default function Index() {
  // need to move state management for nodes here.
  const [currentNodeId, setCurrentNodeId] = useState(null);

  // pulling from db need to create data structure and memoize it
  const db = useLoaderData();
  const metadata = db.metadata;
  const hierarchy = db.hierarchy;
  const rootNodeId = db.root[0].id;

  // 1. create function that takes currentNodeId state if null default to rootNodeId.
  // 2. root of data structure will be currentNodeId/rootNodeId
  // 3. itterate through hierarchy to find ids with parrent ids matching currentNodeId/rootNodeId
  // 4. for each match create new child node in data structure
  // 5. once compleate memoize data structure

  const DisplayDirectoryProps = {
    // metadata: metadata,
    // hierarchy: hierarchy,
    currentNodeId: currentNodeId,
    setCurrentNodeId: setCurrentNodeId
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
