import { useMutation, useQuery } from "@apollo/client"
import { useToast } from "@chakra-ui/core"
import { Redirect } from "@reach/router"
import React, { useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { FaEnvelope } from "react-icons/fa"
import {
  AddMapVotesVars,
  ADD_MAP_VOTES,
} from "../../graphql/mutations/addMapVotes"
import { MapVotesData, MAP_VOTES } from "../../graphql/queries/mapVotes"
import { USER } from "../../graphql/queries/user"
import Error from "../common/Error"
import Loading from "../common/Loading"
import Alert from "../elements/Alert"
import Button from "../elements/Button"
import MapVoteGrid from "./MapVoteGrid"

const MapVoting = () => {
  const { data, error, loading } = useQuery<MapVotesData>(MAP_VOTES)
  const {
    data: userData,
    error: userQueryError,
    loading: userQueryLoading,
  } = useQuery(USER)
  const toast = useToast()
  const [votes, setVotes] = useState<
    {
      name: string
      sz: -1 | 0 | 1
      tc: -1 | 0 | 1
      rm: -1 | 0 | 1
      cb: -1 | 0 | 1
    }[]
  >([])

  const [addMapVotes, { loading: addVotesLoading }] = useMutation<
    boolean,
    AddMapVotesVars
  >(ADD_MAP_VOTES, {
    variables: { votes },
    onCompleted: (data) => {
      window.scrollTo(0, 0)
      toast({
        description: `Map votes submitted`,
        position: "top-right",
        status: "success",
        duration: 10000,
      })
    },
    onError: (error) => {
      toast({
        title: "An error occurred",
        description: error.message,
        position: "top-right",
        status: "error",
        duration: 10000,
      })
    },
    refetchQueries: [{ query: MAP_VOTES }],
  })

  useEffect(() => {
    if (loading || error || !data) {
      return
    }

    // this is to remove the __typename property
    setVotes(
      data.mapVotes.map((vote) => ({
        name: vote.name,
        sz: vote.sz,
        tc: vote.tc,
        rm: vote.rm,
        cb: vote.cb,
      }))
    )
  }, [data, error, loading])

  if (error) return <Error errorMessage={error.message} />
  if (userQueryError) return <Error errorMessage={userQueryError.message} />
  if (loading || userQueryLoading || !userData || !data) return <Loading />
  if (!userData.user) return <Redirect to="/access" />
  if (!data.mapVotes) return <Redirect to="/404" />

  return (
    <>
      <Helmet>
        <title>Plus Server Map Voting | sendou.ink</title>
      </Helmet>
      <Alert status="info" mt="0px">
        You can update your votes as often as you wish but new map list is only
        generated monthly
      </Alert>
      <MapVoteGrid votes={votes} setVotes={setVotes} />
      <Button
        icon={FaEnvelope}
        onClick={() => addMapVotes()}
        loading={addVotesLoading}
      >
        Submit
      </Button>
    </>
  )
}

export default MapVoting
