import { gql, DocumentNode } from "@apollo/client"

export const HIDE_FREE_AGENT_POST: DocumentNode = gql`
  mutation hideFreeAgentPost {
    hideFreeAgentPost
  }
`
