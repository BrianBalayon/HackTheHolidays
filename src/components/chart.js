import React from "react";
import * as d3 from "d3";
import { useTheme } from "@material-ui/core";

const Chart = ({ className, tokens, center }) => {
   let keys = Object.keys(tokens);

   if (keys.length === 1) {
      return <></>;
   }

   let pie = d3.pie()(
      keys.map((k) => {
         return tokens[k].vals.usd;
      })
   );

   const height = 300;
   const width = 300;

   return (
         <svg height={height} width={width} className={className}>
            <g transform={`translate(${width / 2},${height / 2})`}>
               <Slice pie={pie} />
            </g>
         </svg>
   );
};

const Slice = (props) => {
   const theme = useTheme();
   const primary = theme.palette.primary.main;
   const secondary = theme.palette.secondary.main;
   let { pie } = props;

   //    let arc = d3.arc().innerRadius(85).outerRadius(100);
   let arc = d3.arc().innerRadius(75).outerRadius(100);

   let interpolate = d3.interpolateRgb(primary, secondary);

   return pie.map((slice, index) => {
      let sliceColor = interpolate(index / (pie.length - 1));

      return <path key={index} d={arc(slice)} fill={sliceColor} />;
   });
};

export default Chart;
