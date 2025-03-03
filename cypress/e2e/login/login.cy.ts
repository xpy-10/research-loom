import { cyLogin, cyLogout } from "../cy-utils"
import { PASSWORD1, TEST_URL, USER1 } from "../testConstants"

describe('login and logout process', () => {
    it('visits the login page and logs out', () => {
        cyLogin(TEST_URL, USER1, PASSWORD1)
        cyLogout(TEST_URL)
    })
})