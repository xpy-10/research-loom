'use client'
import { useOrganization } from "@clerk/nextjs"

export default function MemberList() {
  const { memberships } = useOrganization({
    memberships: {
      infinite: true, // Append new data to the existing list
      keepPreviousData: true, // Persist the cached data until the new data has been fetched
    },
  })

  if (!memberships) {
    // Handle loading state
    return <></>
  }

  return (
    <div>
      <h2>Organization members</h2>
      <ul>
        {memberships.data?.map((membership) => (
          <li key={membership.id}>
            {membership.organization.id} &lt;
            {membership.publicUserData.firstName} {membership.publicUserData.lastName} &lt;
            {membership.publicUserData.identifier}&gt; :: {membership.role}
          </li>
        ))}
      </ul>

      <button
        disabled={!memberships.hasNextPage} // Disable the button if there are no more available pages to be fetched
        onClick={memberships.fetchNext}
      >
        Load more
      </button>
    </div>
  )
}