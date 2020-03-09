import React, { useContext, useState } from "react"
import { Flex, Box, Image, IconButton, Heading } from "@chakra-ui/core"
import { FreeAgentPost } from "../../types"
import UserAvatar from "../common/UserAvatar"
import { Link } from "@reach/router"
import MyThemeContext from "../../themeContext"
import { FaTwitter, FaPlus, FaMinus } from "react-icons/fa"
import { top500 } from "../../assets/imageImports"
import { countries } from "../../utils/lists"
import Flag from "../common/Flag"
import RoleIcons from "./RoleIcons"
import WeaponImage from "../common/WeaponImage"
import VCIcon from "./VCIcon"

interface FreeAgentCardProps {
  post: FreeAgentPost
}

const hasExtraInfo = (post: FreeAgentPost) => {
  const { activity, description, looking_for, past_experience } = post
  if (!activity && !description && !looking_for && !past_experience) {
    return false
  }

  return true
}

const FreeAgentCard: React.FC<FreeAgentCardProps> = ({ post }) => {
  const [expanded, setExpanded] = useState(false)
  const { grayWithShade, themeColorWithShade } = useContext(MyThemeContext)
  const { discord_user } = post
  const canBeExpanded = hasExtraInfo(post)
  return (
    <Flex
      rounded="lg"
      overflow="hidden"
      boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
      p="25px"
      flexDirection="column"
      justifyContent="space-between"
      maxW="500px"
    >
      <Flex justifyContent="space-between" flexWrap="wrap" alignItems="center">
        <Box color="#999999" width="50px" m="1em">
          {new Date(parseInt(post.createdAt)).toLocaleDateString()}
        </Box>
        <Box width="50px" m="1em">
          {discord_user.top500 && (
            <Image
              src={top500}
              alt="x rank top 500 logo"
              height="40px"
              width="auto"
              title="Free agent has reached Top 500 in X Rank"
            />
          )}
        </Box>
      </Flex>
      <Flex flexDirection="column" alignItems="center">
        <UserAvatar
          twitterName={discord_user.twitter_name}
          name={discord_user.username}
          mr="5px"
          size="lg"
        />

        <Box
          as="span"
          fontWeight="semibold"
          letterSpacing="wide"
          fontSize="md"
          mt="0.5em"
        >
          <Flex alignItems="center">
            <Link to={`/u/${discord_user.discord_id}`}>
              {discord_user.username}#{discord_user.discriminator}
            </Link>
            {discord_user.twitter_name && (
              <a href={`https://twitter.com/${discord_user.twitter_name}`}>
                <Box color="#1DA1F2" as={FaTwitter} ml="0.5em" />
              </a>
            )}
          </Flex>
        </Box>
        <Box color={grayWithShade}>
          {discord_user.country && (
            <>
              <Flag code={discord_user.country} />
              {countries.find(obj => obj.code === discord_user.country)?.name}
            </>
          )}
        </Box>
      </Flex>
      <Flex flexDirection="column" alignItems="center" mt="1em">
        <Flex justifyContent="center" w="250px">
          {discord_user?.weapons &&
            discord_user.weapons.map(wpn => (
              <Box mx="0.3em" key={wpn}>
                <WeaponImage englishName={wpn} size="SMALL" />
              </Box>
            ))}
        </Flex>
      </Flex>
      <Flex justifyContent="center" mt="2em">
        <Box mr="0.5em">
          <RoleIcons playstyles={post.playstyles} />
        </Box>
        <Box borderLeft="1px solid" borderColor="#999999" ml="0.5em" px="1em">
          <VCIcon canVC={post.can_vc} />
        </Box>
      </Flex>
      {canBeExpanded && (
        <Flex mt="2em" justifyContent="center">
          <IconButton
            variant="ghost"
            aria-label="More information"
            isRound
            fontSize="20px"
            icon={expanded ? FaMinus : FaPlus}
            onClick={() => setExpanded(!expanded)}
          />
        </Flex>
      )}
      {expanded && (
        <Box whiteSpace="pre-wrap">
          {post.activity && (
            <Box>
              <Heading size="md" color={themeColorWithShade}>
                Activity
              </Heading>
              {post.activity}
            </Box>
          )}
          {post.looking_for && (
            <Box mt={post.activity ? "1em" : undefined}>
              <Heading size="md" color={themeColorWithShade}>
                Looking for
              </Heading>
              {post.looking_for}
            </Box>
          )}
          {post.past_experience && (
            <Box mt={post.activity || post.looking_for ? "1em" : undefined}>
              <Heading size="md" color={themeColorWithShade}>
                Past experience
              </Heading>
              {post.past_experience}
            </Box>
          )}
          {post.description && (
            <Box
              mt={
                post.activity || post.looking_for || post.past_experience
                  ? "1em"
                  : undefined
              }
            >
              <Heading size="md" color={themeColorWithShade}>
                Description
              </Heading>
              {post.description}
            </Box>
          )}
        </Box>
      )}
    </Flex>
  )
}

export default FreeAgentCard