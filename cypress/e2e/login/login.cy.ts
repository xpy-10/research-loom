const USER1 = 'test_user@test.com'
const PASSWORD1 = 'abc123password'
const USER2 = 'test_user2@test.com'
const PASSWORD2 = 'abc123password'
const TEST_URL = 'localhost:3000'



describe('login and logout process', () => {
    beforeEach(() => {
        cy.visit(`${TEST_URL}`)
    })
    it('visits the login page and logs out', () => {
        cy.get('div.cl-rootBox.cl-signIn-root').should('be.visible')
        cy.get('input#identifier-field.cl-formFieldInput').should('exist').type(`${USER1}`)
        cy.get('button.cl-formButtonPrimary.cl-button').should('exist').click()
        cy.get('input#password-field.cl-formFieldInput').should('be.visible').type(`${PASSWORD1}`)
        cy.get('button.cl-formButtonPrimary.cl-button').should('exist').click()
        cy.contains('Hi welcome to Research Loom').should('be.visible')
        cy.get('button.cl-userButtonTrigger.cl-button').should('exist').click()
        cy.get('button.cl-userButtonPopoverActionButton.cl-button.cl-userButtonPopoverActionButton__signOut').should('be.visible').click()
        cy.get('div.cl-rootBox.cl-signIn-root').should('be.visible')
    })
})