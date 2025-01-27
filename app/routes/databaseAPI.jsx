import { response } from "express";
import { data } from "@remix-run/node";

export const action = async ({ request }) => {
  console.log(data(response));
  return Response.json({ body: "data "}, { status: 200 })
}
