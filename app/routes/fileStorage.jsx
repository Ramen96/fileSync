export const action = () => {
  const myObject = {
  "key" : "value"
}
  console.log("ajsdlkfjaslkd")
  return new Response(JSON.stringify(myObject), {
    status: 200,
    headers : {
      "Content-Type": "application/json",
    }
  })
} 