const {
  UserInputError,
  AuthenticationError,
  gql,
} = require("apollo-server-express")
const shuffle = require("../utils/shuffleArray")
const User = require("../mongoose-models/user")
const Suggested = require("../mongoose-models/suggested")
const Summary = require("../mongoose-models/summary")
const VotedPerson = require("../mongoose-models/votedperson")
const State = require("../mongoose-models/state")

const typeDef = gql`
  extend type Query {
    plusInfo: PlusGeneralInfo
    hasAccess(discord_id: String!, server: String!): Boolean!
    suggestions: [Suggested!]!
    usersForVoting: UsersForVoting!
    summaries: [Summary!]
  }

  extend type Mutation {
    addSuggestion(
      discord_id: String!
      server: String!
      region: String!
      description: String!
    ): Boolean!
    addVotes(votes: [VoteInput!]!): Boolean!
    startVoting(ends: String!): Boolean!
    endVoting: Boolean!
  }

  "+1 or +2 LFG server on Discord"
  enum PlusServer {
    ONE
    TWO
  }

  "Region used for voting"
  enum PlusRegion {
    EU
    NA
  }

  type PlusGeneralInfo {
    plus_one_invite_link: String
    plus_two_invite_link: String!
    voting_ends: String
    voter_count: Int!
    eligible_voters: Int!
  }

  type Suggested {
    discord_id: String!
    discord_user: User!
    suggester_discord_id: String!
    suggester_discord_user: User!
    plus_region: PlusRegion!
    plus_server: PlusServer!
    description: String!
    createdAt: String!
  }

  "Status with +1 and +2 related things"
  type PlusStatus {
    membership_status: PlusServer
    vouch_status: PlusServer
    plus_region: PlusRegion
    can_vouch: PlusServer
    voucher_discord_id: String
    can_vouch_again_after: String
  }

  extend type User {
    plus: PlusStatus
  }

  input VoteInput {
    discord_id: String!
    score: Int!
  }

  type VotedPerson {
    discord_id: String!
    voter_discord_id: String!
    plus_server: String!
    month: Int!
    year: Int!
    "Voting result -2 to +2 (-1 to +1 cross-region)"
    score: Int!
  }

  type Score {
    total: Float!
    eu: Float!
    na: Float!
  }

  "Voting result of a player"
  type Summary {
    discord_id: String!
    discord_user: User!
    plus_server: PlusServer!
    month: Int!
    year: Int!
    suggested: Boolean
    vouched: Boolean
    "Average of all scores of the voters for the month 0% to 100%"
    score: Score!
    new: Boolean!
  }

  type UsersForVoting {
    users: [User!]!
    suggested: [Suggested!]!
    votes: [VotedPerson!]!
  }
`

const validateVotes = (votes, users, suggested, user) => {
  const region = user.plus.plus_region

  votes.forEach(vote => {
    const { discord_id, score } = vote

    let votedUser = users.find(
      userInServer => userInServer.discord_id === discord_id
    )

    if (!votedUser) {
      votedUser = suggested.find(
        suggested => suggested.discord_user.discord_id === discord_id
      )
      if (!votedUser)
        throw new UserInputError(
          `Invalid user voted on with the id ${discord_id}`
        )

      const plus_region_of_suggested = votedUser.plus_region
      votedUser = votedUser.discord_user
      votedUser.plus = {}
      votedUser.plus.plus_region = plus_region_of_suggested
    }

    if (score !== -2 && score !== -1 && score !== 1 && score !== 2)
      throw new Error(`Invalid score provided: ${score}`)

    if ((score === -2 || score === 2) && region !== votedUser.plus.plus_region)
      throw new Error("Score of -2 or 2 given cross region")
  })
}

const resolvers = {
  Query: {
    hasAccess: async (root, args) => {
      const user = await User.findOne({ discord_id: args.discord_id }).catch(
        e => {
          throw (new Error(),
          {
            invalidArgs: args,
          })
        }
      )

      if (!user || !user.plus) return false

      const { membership_status, vouch_status } = user.plus
      let membership_code =
        membership_status === "TWO" || vouch_status === "TWO" ? "TWO" : null
      membership_code =
        membership_status === "ONE" || vouch_status === "ONE"
          ? "ONE"
          : membership_code

      if (membership_code === "ONE") return true
      if (membership_code === "TWO" && args.server === "TWO") return true

      return false
    },
    plusInfo: async (root, args, ctx) => {
      if (!ctx.user) return null
      if (
        !ctx.user.plus ||
        (!ctx.user.plus.membership_status && !ctx.user.plus.vouch_status)
      ) {
        return null
      }

      const plus_server =
        ctx.user.plus.membership_status === "ONE" ||
        ctx.user.plus.vouch_status === "ONE"
          ? "ONE"
          : "TWO"

      const state = await State.findOne({})

      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const votedPeople = await VotedPerson.find({
        month,
        year,
        plus_server: ctx.user.plus.membership_status,
      })

      const votedIds = new Set()

      votedPeople.forEach(vote => {
        votedIds.add(vote.voter_discord_id)
      })

      const eligible_voters = await User.countDocuments({
        "plus.membership_status": ctx.user.plus.membership_status,
      })

      return {
        plus_one_invite_link:
          plus_server === "ONE" ? process.env.PLUS_ONE_LINK : null,
        plus_two_invite_link: process.env.PLUS_TWO_LINK,
        voting_ends: state.voting_ends,
        voter_count: votedIds.size,
        eligible_voters,
      }
    },
    usersForVoting: async (root, args, ctx) => {
      if (!ctx.user) throw new UserInputError("Not logged in")
      if (!ctx.user.plus || !ctx.user.plus.membership_status)
        throw new UserInputError("Not plus server member")
      const plus_server = ctx.user.plus.membership_status

      const users = await User.find({
        $or: [
          {
            "plus.membership_status": plus_server,
          },

          { "plus.vouch_status": plus_server },
        ],
      }).catch(e => {
        throw (new Error(),
        {
          error: e,
        })
      })

      const suggested = await Suggested.find({ plus_server })
        .populate("discord_user")
        .populate("suggester_discord_user")
        .catch(e => {
          throw (new Error(),
          {
            error: e,
          })
        })

      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const votes = await VotedPerson.find({
        plus_server,
        month,
        year,
        voter_discord_id: ctx.user.discord_id,
      })

      shuffle(users)
      shuffle(suggested)

      return { users, suggested, votes }
    },
    suggestions: (root, args, ctx) => {
      if (!ctx.user || !ctx.user.plus) return null
      const searchCriteria =
        ctx.user.plus.membership_status === "ONE" ? {} : { plus_server: "TWO" }
      return Suggested.find(searchCriteria)
        .populate("discord_user")
        .populate("suggester_discord_user")
        .sort({ createdAt: "desc" })
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })
    },
    summaries: (root, args, ctx) => {
      if (!ctx.user || !ctx.user.plus || !ctx.user.plus.membership_status)
        return null
      const searchCriteria =
        ctx.user.plus.membership_status === "ONE" ? {} : { plus_server: "TWO" }

      return Summary.find(searchCriteria)
        .populate("discord_user")
        .sort({ "score.total": "desc", year: "desc", month: "desc" })
    },
  },
  Mutation: {
    addSuggestion: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError("Not logged in.")
      if (!ctx.user.plus || !ctx.user.plus.membership_status) {
        throw new AuthenticationError("Not plus member.")
      }

      const user = await User.findOne({ discord_id: args.discord_id }).catch(
        e => {
          throw (new Error(),
          {
            invalidArgs: args,
            error: e,
          })
        }
      )

      const suggestion = await Suggested.findOne({
        suggester_discord_id: ctx.user.discord_id,
      }).catch(e => {
        throw (new Error(),
        {
          invalidArgs: args,
          error: e,
        })
      })

      if (suggestion) throw new UserInputError("Already suggested this month.")

      const duplicateSuggestion = await Suggested.findOne({
        discord_id: args.discord_id,
        plus_server: args.server,
      }).catch(e => {
        throw (new Error(),
        {
          invalidArgs: args,
          error: e,
        })
      })

      if (duplicateSuggestion)
        throw new UserInputError(
          "This user has already been suggested this month."
        )

      if (!user)
        throw new UserInputError("Suggested user not sendou.ink member.")

      if (args.server !== "ONE" && args.server !== "TWO")
        throw new UserInputError("Server arg has to be 'ONE' or 'TWO'.")

      if (user.plus.membership_status === args.server)
        throw new UserInputError(
          "Suggested user is already a member of the server."
        )

      if (ctx.user.plus.membership_status !== "ONE" && args.server === "ONE")
        throw new UserInputError("Can't suggest to +1 without being +1 member.")

      if (args.region !== "EU" && args.region !== "NA")
        throw new UserInputError("Region arg has to be 'NA' or 'EU'.")

      if (args.description.length > 1000)
        throw new UserInputError("Description has to be below 1000 characters.")

      const newSuggestion = new Suggested({
        discord_id: args.discord_id,
        suggester_discord_id: ctx.user.discord_id,
        plus_region: args.region,
        plus_server: args.server,
        description: args.description,
      })

      await newSuggestion.save().catch(e => {
        throw (new Error(),
        {
          invalidArgs: args,
        })
      })

      return true
    },
    addVotes: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError("Not logged in.")
      if (!ctx.user.plus || !ctx.user.plus.membership_status) {
        throw new AuthenticationError("Not plus member.")
      }

      const state = await State.findOne({})

      const date = new Date()
      if (!state.voting_ends || state.voting_ends < date.getTime())
        throw new Error("Voting now open right now")

      const votedUsers = {}

      args.votes.forEach(vote => {
        if (votedUsers[vote.discord_id])
          throw new UserInputVote(
            `Duplicate vote with the id ${vote.discord_id}`
          )
        votedUsers[vote.discord_id] = true
      })

      const plus_server = ctx.user.plus.membership_status

      const users = await User.find({
        $or: [
          {
            "plus.membership_status": plus_server,
          },

          { "plus.vouch_status": plus_server },
        ],
      })

      const suggested = await Suggested.find({ plus_server })
        .populate("discord_user")
        .populate("suggester_discord_user")

      if (users.length + suggested.length !== args.votes.length)
        throw new UserInputError("Invalid number of votes provided")

      validateVotes(args.votes, users, suggested, ctx.user)

      const year = date.getFullYear()
      const month = date.getMonth() + 1
      await VotedPerson.deleteMany({
        voter_discord_id: ctx.user.discord_id,
        month,
        year,
      })

      const toInsert = args.votes.map(vote => ({
        discord_id: vote.discord_id,
        voter_discord_id: ctx.user.discord_id,
        month,
        year,
        plus_server,
        score: vote.score,
      }))
      await VotedPerson.insertMany(toInsert)

      return true
    },
    startVoting: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError("Not logged in.")
      if (ctx.user.discord_id !== process.env.ADMIN_ID)
        throw new AuthenticationError("Not admin.")

      await State.findOneAndUpdate({}, { voting_ends: args.ends })

      return true
    },
    endVoting: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError("Not logged in.")
      if (ctx.user.discord_id !== process.env.ADMIN_ID)
        throw new AuthenticationError("Not admin.")

      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const votes = await VotedPerson.find({
        month,
        year,
      })
        .populate("discord_user")
        .populate("voter_discord_user")

      const suggested = await Suggested.find({}).populate("discord_user")

      const plus_one_voted = {}
      const plus_two_voted = {}

      votes.forEach(vote => {
        const {
          discord_id,
          plus_server,
          score,
          discord_user,
          voter_discord_user,
        } = vote

        let voted_plus_region = discord_user.plus.plus_region
        const voter_plus_region = voter_discord_user.plus.plus_region

        if (!voted_plus_region) {
          const suggestedUser = suggested.find(
            suggested => suggested.discord_id === discord_id
          )
          voted_plus_region = suggestedUser.plus_region
        }

        const plus_x_voted =
          plus_server === "ONE" ? plus_one_voted : plus_two_voted
        if (!plus_x_voted.hasOwnProperty(discord_id)) {
          plus_x_voted[discord_id] = {}
          plus_x_voted[discord_id].same_region = []
          plus_x_voted[discord_id].other_region = []
        }

        if (!plus_x_voted[discord_id].plus_region) {
          let plus_region =
            discord_user.plus && discord_user.plus.plus_region
              ? discord_user.plus.plus_region
              : null
          if (!plus_region)
            plus_region = suggested.find(
              suggester => suggester.discord_id === discord_id
            ).plus_region
          plus_x_voted[discord_id].plus_region = plus_region
        }

        if (!plus_x_voted[discord_id].membership_status) {
          const membership_status =
            discord_user.plus && discord_user.plus.membership_status
              ? discord_user.plus.membership_status
              : null
          plus_x_voted[discord_id].membership_status = membership_status
        }

        if (
          !plus_x_voted[discord_id].can_not_vouch &&
          discord_user.plus &&
          discord_user.plus.can_vouch_again_after
        ) {
          if (
            parseInt(discord_user.plus.can_vouch_again_after) >
            new Date().getTime()
          )
            plus_x_voted[discord_id].can_not_vouch = true
        }

        if (
          !plus_x_voted[discord_id].voucher_discord_id &&
          discord_user.plus &&
          discord_user.plus.voucher_discord_id &&
          plus_server === discord_user.plus.vouch_status
        ) {
          plus_x_voted[discord_id].voucher_discord_id =
            discord_user.plus.voucher_discord_id
        }

        const arrToPushTo =
          voted_plus_region === voter_plus_region
            ? plus_x_voted[discord_id].same_region
            : plus_x_voted[discord_id].other_region

        arrToPushTo.push(score)
      })

      const votingArrays = [plus_one_voted, plus_two_voted]

      const summariesToInsert = []
      const userUpdates = []
      const preventVouchingUpdates = []

      votingArrays.forEach((votingArray, index) => {
        const arrays_plus_server = index === 0 ? "ONE" : "TWO"
        Object.keys(votingArray).forEach(discord_id => {
          const {
            same_region,
            other_region,
            plus_region,
            membership_status,
            can_not_vouch,
            voucher_discord_id,
          } = votingArray[discord_id]

          const same_total = same_region.reduce((acc, cur) => acc + cur)
          const other_total = other_region.reduce((acc, cur) => acc + cur)

          const same_score = +(
            ((same_total / same_region.length + 2) / 4) *
            100
          ).toFixed(2)

          const other_score = +(
            ((other_total / other_region.length + 1) / 2) *
            100
          ).toFixed(2)

          const total_score = +(
            ((same_total / same_region.length +
              other_total / other_region.length +
              3) /
              6) *
            100
          ).toFixed(2)

          const summary = {
            discord_id,
            plus_server: arrays_plus_server,
            month,
            year,
            score: {
              total: total_score,
              eu: plus_region === "EU" ? same_score : other_score,
              na: plus_region === "EU" ? other_score : same_score,
            },
          }

          if (total_score < 50 && membership_status === arrays_plus_server) {
            if (membership_status === "TWO")
              userUpdates.push(() =>
                User.updateOne(
                  { discord_id },
                  { $set: { "plus.membership_status": null } }
                )
              )
            else
              userUpdates.push(() =>
                User.updateOne(
                  { discord_id },
                  { $set: { "plus.membership_status": "TWO" } }
                )
              )
          } else if (
            total_score >= 50 &&
            membership_status !== arrays_plus_server
          ) {
            if (membership_status === "TWO")
              userUpdates.push(() =>
                User.updateOne(
                  { discord_id },
                  { $set: { "plus.membership_status": "TWO" } }
                )
              )
            else
              userUpdates.push(() =>
                User.updateOne(
                  { discord_id },
                  { $set: { "plus.membership_status": "ONE" } }
                )
              )
          }

          if (voucher_discord_id) {
            summary.vouched = true
            if (total_score < 50) {
              const now = new Date()
              const can_vouch_again_after = new Date(
                now.getFullYear(),
                now.getMonth() + 5,
                1
              )
              preventVouchingUpdates.push(() =>
                User.updateOne(
                  { discord_id: voucher_discord_id },
                  {
                    $set: {
                      "plus.can_vouch_again_after": can_vouch_again_after,
                      "plus.can_vouch": null,
                    },
                  }
                )
              )
            }
          }

          if (!voucher_discord_id && membership_status !== arrays_plus_server) {
            summary.suggested = true
            userUpdates.push(() =>
              User.updateOne(
                { discord_id },
                { $set: { "plus.plus_region": plus_region } }
              )
            )
          }

          if (
            arrays_plus_server === "ONE" &&
            total_score >= 90 &&
            !can_not_vouch
          ) {
            userUpdates.push(() =>
              User.updateOne(
                { discord_id },
                { $set: { "plus.can_vouch": "ONE" } }
              )
            )
          } else if (
            arrays_plus_server === "TWO" &&
            total_score >= 80 &&
            !can_not_vouch
          ) {
            userUpdates.push(() =>
              User.updateOne(
                { discord_id },
                { $set: { "plus.can_vouch": "TWO" } }
              )
            )
          }

          summariesToInsert.push(summary)
        })
      })

      await User.updateMany(
        { "plus.can_vouch": { $exists: true } },
        { $set: { "plus.can_vouch": null } }
      )

      await User.updateMany(
        { "plus.can_vouch_again_after": { $lte: new Date() } },
        { $set: { "plus.can_vouch_again_after": null } }
      )

      await User.updateMany(
        { "plus.vouch_status": { $exists: true } },
        { $set: { "plus.vouch_status": null } }
      )

      await User.updateMany(
        { "plus.voucher_discord_id": { $exists: true } },
        { $set: { "plus.voucher_discord_id": null } }
      )

      userUpdates.forEach(async userUpdateFunction => {
        await userUpdateFunction()
      })

      preventVouchingUpdates.forEach(async userUpdateFunction => {
        await userUpdateFunction()
      })

      await Summary.insertMany(summariesToInsert)
      await Suggested.deleteMany({})
      await VotedPerson.deleteMany({})
      await State.updateOne({}, { $set: { voting_ends: null } })

      return true
    },
  },
}

module.exports = {
  Plus: typeDef,
  plusResolvers: resolvers,
}