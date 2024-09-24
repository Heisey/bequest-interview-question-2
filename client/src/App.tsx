import React from "react";

import * as Hooks from './hooks'

function App() {
  
  const serverData = Hooks.useGetData()
  const updateServer = Hooks.useUpdateData()
  const verifyData = Hooks.useVerify()
  const [updatedData, updatedDataHandler] = React.useState<string |undefined>(undefined)
  const [loading, loadingHandler] = React.useState(false)

  if (serverData.isLoading || loading) return <div>Loading</div>

  if (serverData.isError) return <div>{serverData.error.message}</div>
  if (verifyData.isError) return <div>{verifyData.error.message}</div>
  
  const onSave = async () => {
    try {
      loadingHandler(true)
      await updateServer.mutateAsync({ data: updatedData })
      loadingHandler(false)
    } catch(err) {
      loadingHandler(false)
    }
  }
  const onVerify = async () => {
    try {
      loadingHandler(true)
      await verifyData.mutateAsync(serverData.data.signature)
      loadingHandler(false)
    } catch(err) {
      loadingHandler(false)
    }
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        position: "absolute",
        padding: 0,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
        fontSize: "30px",
      }}
    >
      <div>Saved Data</div>
      <input
        style={{ fontSize: "30px" }}
        type="text"
        value={updatedData || serverData.data?.data}
        onChange={(e) => updatedDataHandler(e.target.value)}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button style={{ fontSize: "20px" }} onClick={onSave}>
          Update Data
        </button>
        <button style={{ fontSize: "20px" }} onClick={onVerify}>
          Verify Data
        </button>
      </div>

      <div style={{ gap: '10px' }}>
        {verifyData.data ? <div>data verified</div> : <div>Data not verified</div>}
      </div>
    </div>
  );
}

export default App;



// const updateData = async () => {
//   await fetch(API_URL, {
//     method: "POST",
//     body: JSON.stringify({ data }),
//     headers: {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//     },
//   });

//   await getData();
// };