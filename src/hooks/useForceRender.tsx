import { useState } from "react";

export default () => {
  const [_, setMockState] = useState({});
  return () => setMockState({});
};
