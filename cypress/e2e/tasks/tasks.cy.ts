import { cyCreateProject, cyCreateTeam, cyDeleteTeam, cyLogin, cyLogout } from "../cy-utils";
import { PASSWORD1, TEST_PROJECT, TEST_PROJECT_DESCRIPTION, TEST_TASK, TEST_TASK_DETAILS, TEST_TEAM, TEST_URL, USER1, USER2 } from "../testConstants";

describe('creates a project', () => {
    beforeEach(() => {
        cyLogin(TEST_URL, USER1, PASSWORD1);
        cyCreateTeam(TEST_TEAM, USER2)
        cyCreateProject(TEST_PROJECT, TEST_PROJECT_DESCRIPTION)
    })
    afterEach(() => {
        cy.visit(TEST_URL)
        cyDeleteTeam(TEST_TEAM)
        cyLogout(TEST_URL)
    })
    it('is able to create new tasks', () => {
        // cy.get(`[data-cy="sidebar-menu-task-management"]`).should('exist').click()
        cy.get(`[data-cy="sidebar-submenu-task-list"]`).should('exist').click()
        cy.get(`[data-cy="add-task-button"]`).should('exist').click()
        cy.wait(5000)
        cy.get(`[data-cy="add-task-form-title"]`).should('exist').type(`${TEST_TASK}`)
        cy.get(`[data-cy="add-task-form-details"]`).should('exist').type(`${TEST_TASK_DETAILS}`)
        cy.get(`[data-cy="add-task-form-submit"]`).should('exist').click()
        cy.wait(5000)

    })
})
