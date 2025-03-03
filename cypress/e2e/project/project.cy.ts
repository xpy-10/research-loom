import { cyCreateTeam, cyDeleteTeam, cyLogin, cyLogout } from "../cy-utils"
import { TEST_URL, USER1, PASSWORD1, TEST_TEAM, USER2, TEST_PROJECT, TEST_PROJECT_DESCRIPTION, TEST_PROJECT_EDITED, TEST_PROJECT_DESCRIPTION_EDITED } from "../testConstants"

describe('creates a project', () => {
    beforeEach(() => {
        cyLogin(TEST_URL, USER1, PASSWORD1);
        cyCreateTeam(TEST_TEAM, USER2)
    })
    afterEach(() => {
        cy.visit(TEST_URL)
        cyDeleteTeam(TEST_TEAM)
        cyLogout(TEST_URL)
    })

    it('creates a new project and is able to edit and delete it', () => {
        cy.get('[data-cy="view/createProjects"]').should('be.visible').click()
        cy.get('[data-cy="create-project-form"]').should('be.visible')
        cy.get('[data-cy="project-name-field"]').should('be.visible').type(`${TEST_PROJECT}`)
        cy.get('[data-cy="project-description-field"]').should('be.visible').type(`${TEST_PROJECT_DESCRIPTION}`)
        cy.get('[data-cy="project-create-submit"]').should('be.visible').click()
        cy.wait(10000)
        cy.get(`[data-cy="project-dropdown-menu-${TEST_PROJECT}"]`).should('exist').click()
        cy.get(`[data-cy="project-dropdown-menu-edit-${TEST_PROJECT}"]`).should('exist').click({force: true})
        cy.get(`[data-cy="edit-project-dialog-${TEST_PROJECT}"]`).should('be.visible')
        cy.wait(2000)
        cy.get(`[data-cy="edit-project-name-input-${TEST_PROJECT}"]`).should('exist').clear().type(`${TEST_PROJECT_EDITED}`)
        cy.get(`[data-cy="edit-project-description-input-${TEST_PROJECT}"]`).should('exist').clear().type(`${TEST_PROJECT_DESCRIPTION_EDITED}`)
        cy.get(`[data-cy="edit-project-submit-${TEST_PROJECT}"]`).should('be.visible').click({force: true})
        cy.wait(10000)
        cy.get(`[data-cy="project-table-row-${TEST_PROJECT_EDITED}"]`).should('be.visible')
        cy.get(`[data-cy="project-table-row-${TEST_PROJECT_DESCRIPTION_EDITED}"]`).should('be.visible')
        cy.get(`[data-cy="project-dropdown-menu-${TEST_PROJECT_EDITED}"]`).should('exist').click()
        cy.get(`[data-cy="project-dropdown-menu-view-${TEST_PROJECT_EDITED}"]`).should('exist').click({force: true})
        cy.wait(10000)
        cy.get(`[data-cy="project-dropdown-menu-${TEST_PROJECT_EDITED}"]`).should('exist').click()
        cy.get(`[data-cy="project-dropdown-menu-delete-${TEST_PROJECT_EDITED}"]`).should('exist').click({force: true})
        cy.wait(10000)
        cy.get(`[data-cy="delete-project-dialog-confirm-${TEST_PROJECT_EDITED}"]`).click()
        cy.wait(10000)
        cy.get(`[data-cy="project-table-row-${TEST_PROJECT_EDITED}"]`).should('not.exist')
        cy.get(`[data-cy="project-table-row-${TEST_PROJECT_DESCRIPTION_EDITED}"]`).should('not.exist')
    })
})