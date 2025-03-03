    
export function cyLogin(url: string, userName: string, password: string) {
    cy.visit(url)
    cy.get('div.cl-rootBox.cl-signIn-root').should('be.visible')
    cy.get('input#identifier-field.cl-formFieldInput').should('exist').type(userName)
    cy.get('button.cl-formButtonPrimary.cl-button').should('exist').click()
    cy.get('input#password-field.cl-formFieldInput').should('be.visible').type(password)
    cy.get('button.cl-formButtonPrimary.cl-button').should('exist').click()
    cy.contains('Hi welcome to Research Loom').should('be.visible')
}

export function cyLogout(url: string) {
    cy.visit(url)
    cy.contains('Hi welcome to Research Loom').should('be.visible')
    cy.get('button.cl-userButtonTrigger.cl-button').should('exist').click({force: true})
    cy.get('button.cl-userButtonPopoverActionButton.cl-button.cl-userButtonPopoverActionButton__signOut').should('be.visible').click()
    cy.get('div.cl-rootBox.cl-signIn-root').should('be.visible')
}

export function cyCreateTeam(teamName: string, member: string) {
    cy.get('button.cl-organizationSwitcherTrigger.cl-button').should('be.visible').click()
    cy.get('div.cl-organizationSwitcherPopoverCard').should('be.visible')
    cy.get('button.cl-organizationSwitcherPopoverActionButton__createOrganization').should('be.visible').click()
    cy.get('input#name-field.cl-formFieldInput__name').should('be.visible').type(teamName)
    cy.get('button.cl-formButtonPrimary.cl-button').click()
    cy.get('div#emailAddress.cl-tagInputContainer').should('be.visible').type(member)
    cy.get('button.cl-formButtonPrimary.cl-button').should('be.visible').contains('Send invitations').click()
    cy.get('button.cl-modalCloseButton.cl-button').click()
}

export function cyDeleteTeam(teamName: string) {
    cy.get('button.cl-organizationSwitcherTrigger.cl-button').should('be.visible').click()
    cy.get('div.cl-organizationSwitcherPopoverCard').should('be.visible')
    cy.get('button.cl-organizationSwitcherPopoverActionButton__manageOrganization.cl-button__manageOrganization').should('be.visible').click()
    cy.get('button.cl-profileSectionPrimaryButton.cl-button.cl-profileSectionPrimaryButton__organizationDanger.cl-button__organizationDanger').should('be.visible').contains('Delete organization').click()
    cy.get('input#deleteOrganizationConfirmation-field').should('be.visible').type(teamName)
    cy.get('button.cl-formButtonPrimary.cl-button').click()
}

export function cyCreateProject(projectName: string, projectDescription: string) {
    cy.get('[data-cy="view/createProjects"]').should('be.visible').click()
    cy.get('[data-cy="create-project-form"]').should('be.visible')
    cy.get('[data-cy="project-name-field"]').should('be.visible').type(`${projectName}`)
    cy.get('[data-cy="project-description-field"]').should('be.visible').type(`${projectDescription}`)
    cy.get('[data-cy="project-create-submit"]').should('be.visible').click()
    cy.wait(10000)
    cy.get(`[data-cy="project-table-row-${projectName}"]`).should('be.visible')
    cy.get(`[data-cy="project-table-row-${projectDescription}"]`).should('be.visible')
    cy.get(`[data-cy="project-dropdown-menu-${projectName}"]`).should('exist').click()
    cy.get(`[data-cy="project-dropdown-menu-view-${projectName}"]`).should('exist').click({force: true})
    cy.wait(10000)
}

export function cyDeleteProjet(projectName: string) {
    cy.get('[data-cy="view/createProjects"]').should('be.visible').click()
    cy.get(`[data-cy="project-dropdown-menu-${projectName}"]`).should('exist').click()
    cy.get(`[data-cy="project-dropdown-menu-delete-${projectName}"]`).should('exist').click({force: true})
    cy.wait(10000)
    cy.get(`[data-cy="delete-project-dialog-confirm-${projectName}"]`).click()
    cy.wait(10000)
    cy.get(`[data-cy="project-table-row-${projectName}"]`).should('not.exist')
}

// sign in as second user
        // cy.get('div.cl-rootBox.cl-signIn-root').should('be.visible')
        // cy.get('input#identifier-field.cl-formFieldInput').should('exist').type(`${USER2}`)
        // cy.get('button.cl-formButtonPrimary.cl-button').should('exist').click()
        // cy.get('input#password-field.cl-formFieldInput').should('be.visible').type(`${PASSWORD2}`)
        // cy.get('button.cl-formButtonPrimary.cl-button').should('exist').click()
        // cy.contains('Hi welcome to Research Loom').should('be.visible')
        // cy.get('button.cl-organizationSwitcherTrigger.cl-button').should('be.visible').click()
        // cy.get('div.cl-organizationSwitcherPopoverCard').should('be.visible').contains(`${TEST_TEAM}`)
        // cy.get('body').type('{esc')
        // cy.get('button.cl-userButtonTrigger.cl-button').should('exist').click()
        // cy.get('button.cl-userButtonPopoverActionButton.cl-button.cl-userButtonPopoverActionButton__signOut').should('be.visible').click()
        // cy.get('div.cl-rootBox.cl-signIn-root').should('be.visible')