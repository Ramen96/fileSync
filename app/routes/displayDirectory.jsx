import Folder from "./components/DisplayDirectory/Folder/folder";
import File from "./components/DisplayDirectory/File/file";
import { prisma } from "../utils/prisma.server";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

export async function loader() {
  return json(await prisma.file_data.findMany({
    where: { relitive_path }
  }));
}

export default function DisplayDirectory() {
  const data = useLoaderData();
  console.log("data: ", data);
  return (
    <>
      <Folder />
      <p
        style={{
          color: "red",
        }}
      >
        Hello World
      </p>
      <File />
    </>
  );
}
