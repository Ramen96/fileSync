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
    
    return data({ metadata, hierarchy });
  } catch (error) {
    console.error("Error fetching data:", error);
    return data({metadata: [], hierarchy: [] }, { status: 500 });
  }
}

export default function Index() {
  // need to move state management for nodes here.
  const [currentNodeId, setCurrentNodeId] = useState(null);

  // pulling from db need to create data structure and memoize it
  const db = useLoaderData();
  const metadata = db.metadata;
  const hierarchy = db.hierarchy;

  const DisplayDirectoryProps = {
    // metadata: metadata,
    // hierarchy: hierarchy,
    currentNodeId: currentNodeId,
    setCurrentNodeId: setCurrentNodeId
  }
    // Problem: The db has no ids for folders only files. Folders are represented by strings for the relitive path 
    // Why this is a problem: A method is needed to be able to delete files/folders and create/delete empty folders. 
    
    // Solution:
    // 1. Created hierarchy and meta data tables
    // -- Heiarchy holds key and value pairs for node ids and their parrent id.
    // -- Metadata, self explanitory holds meta data along with it's id.

    // 2. Create hash table from hierarchy and metadata tables...

    // TODO:
    // #1 when files are uploaded get make new querys to update both tables
    // #2 pull data from both tables to create a hash table
    // #3 update upload method such that if the user is not crrently in the root of the cloud
    //    the file/folder will be placed in their current directory.
    // 4# When updating folders the relitive path is paced and a new folder nodes are created recursively
    //      -- Note: when you upload folders it the metadata object just has the name of the uploaded folder as the root of the webkitdirectory
    //      -- 1. parce the relitive path splitting at for each "/" and create an object for each folder
    //            * Will need a way to prevent duplicates... 
    //              - Create an array of objects and check the name of each one before createing a new node object????

    // console.log(`hierarchy: ${hierarchy}`);
    // console.log(`metadata: ${metadata}`);

    // console.log(`metadata ${JSON.stringify(metadata)}`);

    // for (let item in metadata ) {
    //   console.log(metadata[item]);
    // }
    // console.log(`hierarchy: ${JSON.stringify(hierarchy)}`);

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
