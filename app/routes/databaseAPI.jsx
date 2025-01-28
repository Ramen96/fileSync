import { response } from "express";
import { data } from "@remix-run/node";
import { resolveConfig } from "@remix-run/dev/dist/config";

export const action = async ({ request }) => {
  try {
    const body  = request.json();
    console.log(await body);
  } catch (err) {
    console.error(`error reading request`);
  }
  return Response.json({ body: "data "}, { status: 200 })
}
