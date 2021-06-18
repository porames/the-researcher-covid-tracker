import React from "react";
const Pulse = React.forwardRef<HTMLDivElement, { style?: any }>(
  (props, ref) => <div className="pulse-blob" ref={ref} {...props}></div>
);
export default Pulse;
