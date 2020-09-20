import React from "react";
import { Placement } from "../../frontend-react/src/types";
import ModesAccordion from "./ModesAccordion";

interface XRankTabProps {
  placements: Placement[];
}

const XRankTab: React.FC<XRankTabProps> = ({ placements }) => {
  return (
    <>
      <ModesAccordion placements={placements} />
    </>
  );
};

export default XRankTab;
