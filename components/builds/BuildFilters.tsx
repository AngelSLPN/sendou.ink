import {
  Box,
  Grid,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  Select,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { Ability } from "@prisma/client";
import AbilityIcon from "components/common/AbilityIcon";
import {
  UseBuildsByWeaponDispatch,
  UseBuildsByWeaponState,
} from "hooks/builds";
import { abilities, isMainAbility } from "lib/lists/abilities";
import { useMyTheme } from "lib/useMyTheme";
import { Fragment } from "react";
import { FiTrash } from "react-icons/fi";

interface Props {
  filters: UseBuildsByWeaponState["filters"];
  dispatch: UseBuildsByWeaponDispatch;
}

const BuildFilters: React.FC<Props> = ({ filters, dispatch }) => {
  const { gray } = useMyTheme();

  return (
    <>
      <Grid
        templateColumns="1fr 1fr 2fr 2fr"
        alignItems="center"
        justifyContent="center"
        placeItems="center"
        maxWidth={24}
        gridRowGap={4}
        mx="auto"
      >
        {filters.map((filter, index) => (
          <Fragment key={filter.ability}>
            <Box mb="-1.2rem" />
            <Box mb="-1.2rem" />
            <Box
              mb="-1.2rem"
              fontSize="sm"
              color={
                filter.abilityPoints &&
                filter.abilityPoints.min > filter.abilityPoints.max
                  ? "red.500"
                  : gray
              }
              pr={2}
            >
              {isMainAbility(filter.ability) ? (
                <Trans>Included</Trans>
              ) : (
                <Trans>Min AP</Trans>
              )}
            </Box>
            <Box
              mb="-1.2rem"
              fontSize="sm"
              color={
                filter.abilityPoints &&
                filter.abilityPoints.min > filter.abilityPoints.max
                  ? "red.500"
                  : gray
              }
            >
              {isMainAbility(filter.ability) ? (
                <Trans>Excluded</Trans>
              ) : (
                <Trans>Max AP</Trans>
              )}
            </Box>
            <IconButton
              icon={<FiTrash />}
              onClick={() => dispatch({ type: "REMOVE_FILTER", index })}
              aria-label="Remove filter"
              variant="ghost"
              isRound
            />
            <Box mx={2} mt={2}>
              <AbilityIcon ability={filter.ability} size="TINY" />
            </Box>
            {isMainAbility(filter.ability) ? (
              <>
                <Radio
                  isChecked={filter.hasAbility}
                  onClick={() =>
                    dispatch({
                      type: "SET_FILTER_HAS_ABILITY",
                      index,
                      hasAbility: true,
                    })
                  }
                  value="HAS_ABILITY"
                />
                <Radio
                  isChecked={!filter.hasAbility}
                  value="DOES_NOT_HAVE_ABILITY"
                  onClick={() =>
                    dispatch({
                      type: "SET_FILTER_HAS_ABILITY",
                      index,
                      hasAbility: false,
                    })
                  }
                />
              </>
            ) : (
              <>
                <NumberInput
                  size="sm"
                  m={2}
                  width={24}
                  min={0}
                  max={57}
                  value={filter.abilityPoints!.min}
                  onChange={(_, value) =>
                    dispatch({
                      type: "SET_FILTER_ABILITY_POINTS",
                      abilityPoints: { ...filter.abilityPoints!, min: value },
                      index,
                    })
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>

                <NumberInput
                  size="sm"
                  m={2}
                  width={24}
                  min={0}
                  max={57}
                  value={filter.abilityPoints!.max}
                  onChange={(_, value) =>
                    dispatch({
                      type: "SET_FILTER_ABILITY_POINTS",
                      abilityPoints: { ...filter.abilityPoints!, max: value },
                      index,
                    })
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </>
            )}
          </Fragment>
        ))}
      </Grid>
      <Box mt={4}>
        <Select
          onChange={(e) =>
            dispatch({
              type: "ADD_FILTER",
              ability: e.target.value as Ability,
            })
          }
          size="sm"
          width={48}
          m={2}
        >
          <option hidden value="NO_VALUE">
            {t`Filter by ability`}
          </option>
          {abilities
            .filter(
              (ability) =>
                !filters.some((filter) => ability.code === filter.ability)
            )
            .map((ability) => (
              <option key={ability.code} value={ability.code}>
                {ability.name}
              </option>
            ))}
        </Select>
      </Box>
    </>
  );
};

export default BuildFilters;
