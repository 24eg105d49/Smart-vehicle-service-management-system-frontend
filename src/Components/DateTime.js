import React, { useState, useEffect } from "react";

export const DateTime = () => {
  var [date, setDate] = useState(new Date());

  useEffect(() => {
    var timer = setInterval(() => setDate(new Date()), 1000);
    return function cleanup() {
      clearInterval(timer);
    };
  });

  return (
    <div>
      Date : {date.toLocaleDateString()}&emsp; Time :{" "}
      {date.toLocaleTimeString()}
    </div>
  );
};

export default DateTime;
