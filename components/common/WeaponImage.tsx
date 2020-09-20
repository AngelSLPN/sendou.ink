import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Weapon } from "../../frontend-react/src/types.js";
import english_internal from "../../frontend-react/src/utils/english_internal.json";

interface WeaponImageProps {
  englishName: Weapon;
  size: "SMALL" | "SMEDIUM" | "MEDIUM" | "BIG";
  asInlineBlock?: boolean;
  noTitle?: boolean;
}

const sizeWhMap: Record<
  "SMALL" | "SMEDIUM" | "MEDIUM" | "BIG",
  string | undefined
> = {
  SMALL: "32px",
  SMEDIUM: "48px",
  MEDIUM: "64px",
  BIG: undefined,
};

const WeaponImage: React.FC<WeaponImageProps> = ({
  englishName,
  size,
  asInlineBlock,
  noTitle,
}) => {
  const [src, setSrc] = useState<string | null>(null);
  const { t } = useTranslation();
  const wh = sizeWhMap[size];

  useEffect(() => {
    import(
      `../../assets/weapons/Wst_${english_internal[englishName]}.png`
    ).then((img) => setSrc(img.default));
  }, []);

  return (
    <>
      {src && (
        <img
          src={src}
          alt={t(`game;${englishName}`)}
          title={noTitle ? undefined : t(`game;${englishName}`)}
          style={{
            width: wh,
            height: wh,
            display: asInlineBlock ? "inline-block" : undefined,
          }}
        />
      )}
    </>
  );
};

export default WeaponImage;
