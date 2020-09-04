import React from "react"
import { useQuery } from "@apollo/react-hooks"

import Suggestions from "./Suggestions"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { PLUS_INFO, PlusInfoData } from "../../graphql/queries/plusInfo"
import { USER } from "../../graphql/queries/user"
import { Redirect, RouteComponentProps, Link } from "@reach/router"
import PageHeader from "../common/PageHeader"
import { FaHistory, FaVoteYea, FaMapMarkedAlt } from "react-icons/fa"
import Button from "../elements/Button"
import { Helmet } from "react-helmet-async"
import { Flex, Box } from "@chakra-ui/core"
import Maplist from "./Maplist"
import {
  PLUS_MAPLISTS,
  PlusMaplistsData,
} from "../../graphql/queries/plusMaplists"
import Voting from "./Voting"

const PlusPage: React.FC<RouteComponentProps> = () => {
  const { data, error, loading } = useQuery<PlusInfoData>(PLUS_INFO)
  const {
    data: userData,
    error: userQueryError,
    loading: userQueryLoading,
  } = useQuery(USER)
  const {
    data: maplistData,
    error: maplistError,
    loading: maplistLoading,
  } = useQuery<PlusMaplistsData>(PLUS_MAPLISTS)

  if (error) return <Error errorMessage={error.message} />
  if (userQueryError) return <Error errorMessage={userQueryError.message} />
  if (maplistError) return <Error errorMessage={maplistError.message} />
  if (loading || userQueryLoading || !data || maplistLoading || !maplistData)
    return <Loading />
  if (!userData.user) return <Redirect to="/access" />
  if (!data.plusInfo) return <Redirect to="/404" />

  const maplist = maplistData.plusMaplists[0]
  const lastMonthsMaplist = maplistData.plusMaplists[1]
  const plusInfo = data.plusInfo

  return (
    <>
      <Helmet>
        <title>Plus Server Home | sendou.ink</title>
      </Helmet>
      <PageHeader title="Plus Server" />
      <Flex mb="1em" flexWrap="wrap">
        <Box mr="1em" mt="1em">
          <Link to="/plus/history">
            <Button outlined icon={<FaHistory />}>
              Show player voting history
            </Button>
          </Link>
        </Box>
        <Box mr="1em" mt="1em">
          <Link to="/plus/maphistory">
            <Button outlined icon={<FaMapMarkedAlt />}>
              Show map voting history
            </Button>
          </Link>
        </Box>
        <Box mr="1em" mt="1em">
          <Link to="/plus/mapvoting">
            <Button outlined icon={<FaVoteYea />}>
              Vote on maps
            </Button>
          </Link>
        </Box>
      </Flex>
      {plusInfo.voting_ends ? (
        <Voting
          user={userData.user}
          votingEnds={parseInt(plusInfo.voting_ends)}
          votedSoFar={plusInfo.voter_count}
          eligibleVoters={plusInfo.eligible_voters}
        />
      ) : (
        <>
          <Maplist
            name={maplist.name}
            sz={maplist.sz}
            pastSz={lastMonthsMaplist.sz}
            tc={maplist.tc}
            pastTc={lastMonthsMaplist.tc}
            rm={maplist.rm}
            pastRm={lastMonthsMaplist.rm}
            cb={maplist.cb}
            pastCb={lastMonthsMaplist.cb}
            voterCount={maplist.plus.voter_count}
          />
          <Suggestions user={userData.user} />
        </>
      )}
    </>
  )
}

export default PlusPage
