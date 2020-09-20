import { Box, Grid, Heading } from "@chakra-ui/core";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroller";
import { FreeAgentPost } from "../../frontend-react/src/types";
import Alert from "../elements/Alert";
import Button from "../elements/Button";
import FreeAgentCard from "./FreeAgentCard";

interface PostsAccordionProps {
  posts: FreeAgentPost[];
  canLike: boolean;
  likedUsersIds: string[];
}

const Posts: React.FC<PostsAccordionProps> = ({
  posts,
  canLike,
  likedUsersIds,
}) => {
  const { t } = useTranslation();
  const [agentsToShow, setAgentsToShow] = useState(5);

  if (posts.length === 0) {
    return (
      <Alert status="info">
        {t("freeagents;No free agents found with the current filter")}
      </Alert>
    );
  }
  return (
    <>
      <Grid gridTemplateColumns="repeat(auto-fit, minmax(260px, 1fr))" mt="1em">
        <InfiniteScroll
          pageStart={1}
          loadMore={(page) => setAgentsToShow(page * 10)}
          hasMore={agentsToShow < posts.length}
        >
          {posts
            .filter((_, index) => index < agentsToShow)
            .map((post) => (
              <Box my="1em" key={post.id}>
                <FreeAgentCard
                  post={post}
                  canLike={canLike}
                  likedUsersIds={likedUsersIds}
                />
              </Box>
            ))}
        </InfiniteScroll>
      </Grid>
      <Box w="50%" textAlign="center" mx="auto" mt="1em">
        <Heading size="sm">
          {t("freeagents;No more free agents to show")}
        </Heading>
        <Box mt="1em">
          <Button outlined onClick={() => window.scrollTo(0, 0)}>
            {t("freeagents;Return to the top")}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Posts;
