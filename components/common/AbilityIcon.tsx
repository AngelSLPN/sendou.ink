import { Box } from "@chakra-ui/react";
import Image from "next/image";

//https://github.com/loadout-ink/splat2-calc

const sizeMap = {
  MAIN: 50,
  SUB: 40,
  TINY: 30,
  SUBTINY: 20,
} as const;

interface AbilityIconProps {
  // TODO: use enum from generated/graphql.tsx
  ability: string | "EMPTY";
  size: "MAIN" | "SUB" | "TINY" | "SUBTINY";
  loading?: "eager";
}

const AbilityIcon: React.FC<AbilityIconProps> = ({
  ability,
  size,
  loading,
}) => {
  const sizeNumber = sizeMap[size];

  return (
    <Box
      style={{
        zIndex: 2,
        borderRadius: "50%",
        background: "#000",
        border: "2px solid #888",
        borderRight: "0px",
        borderBottom: "0px",
        backgroundSize: "100%",
        boxShadow: "0 0 0 1px #000",
        userSelect: "none",
        display: "inline-block",
        width: sizeNumber,
        height: sizeNumber,
      }}
    >
      <Image
        src={`/abilityIcons/${ability}.png`}
        width={sizeNumber}
        height={sizeNumber}
        alt={ability}
        loading={loading ?? "lazy"}
      />
    </Box>
  );
};

export default AbilityIcon;
