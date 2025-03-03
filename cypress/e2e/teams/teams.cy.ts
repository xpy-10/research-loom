import {cyCreateTeam, cyDeleteTeam, cyLogin, cyLogout} from "../cy-utils"
import { PASSWORD1, PASSWORD2, TEST_TEAM, TEST_URL, USER1, USER2 } from "../testConstants"

describe('create a team and invite extra member', () => {
    beforeEach(() => {
        cyLogin(TEST_URL, USER1, PASSWORD1);
    }) 
    afterEach(() => {
        cyLogout(TEST_URL)
    })
    it('creates a new team with clerk organizations and invite users', () => {
        cyCreateTeam(TEST_TEAM, USER2)
    })
     it('deletes previously made organization', () => {
        cyDeleteTeam(TEST_TEAM)
    })
})