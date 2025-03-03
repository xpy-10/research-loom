'use client'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { buttonStyle } from "@/lib/utils";
import { useOrganization } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function TeamMemberSelector({selectedTeamMemberId, setSelectedTeamMemberId}: {selectedTeamMemberId: string|undefined|null, setSelectedTeamMemberId: (arg:string) => void}) {
    const { memberships } = useOrganization({
        memberships: {
            infinite: true,
            keepPreviousData: true
        }
    });

    if (!memberships) {
        return <></>
    }
    /* eslint-disable react-hooks/rules-of-hooks */
    const [assignee , setAssignee] = useState<string>('Not assigned');

    useEffect(() => {
        if (memberships) {
            const selectedMember = memberships && memberships.data && memberships.data.find((member) => (member.id == selectedTeamMemberId));
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            selectedMember && setAssignee(`${selectedMember.publicUserData.firstName} ${selectedMember.publicUserData.lastName}`);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberships]);
    /* eslint-enable react-hooks/rules-of-hooks */
    return (
        <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <div className={`${buttonStyle}`}>
                {assignee}
            </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Assignee</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={assignee} onValueChange={(value)=> {setAssignee(value)}}>
                <DropdownMenuRadioItem onClick={() => {setSelectedTeamMemberId(''); setAssignee('Not Assigned')}} value={'Not Assigned'}>
                               Not Assigned
                </DropdownMenuRadioItem>
                   { memberships.data?.map((membership) => {
                        const firstName = membership.publicUserData.firstName||membership.publicUserData.identifier;
                        const lastName = membership.publicUserData.lastName||'';
                        return (
                            <DropdownMenuRadioItem key={membership.id} onClick={() => setSelectedTeamMemberId(membership.id)} value={`${firstName} ${lastName}`}>
                                {`${firstName} ${lastName}`}
                            </DropdownMenuRadioItem>
                            )
                   })}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>

        </DropdownMenu>
        </>
    )
}