describe('Basic operation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.createAccount('fnG8iv4t!%Qa')
  })

  it('can create and edit items', () => {
    cy.createPerson({ firstName: 'Frodo', lastName: 'Baggins' })
      .saveDrawer()
      .reload()
    cy.dataCy('page-content')
      .contains('Frodo Baggins')
      .click()
    cy.dataCy('description').type('Underhill')
    cy.saveDrawer()
    cy.dataCy('page-content')
      .contains('Underhill')
  })

  it('can add & remove notes', () => {
    // Create notes
    cy.createPerson({ firstName: 'Frodo', lastName: 'Baggins' })
      .addNote({ content: '', type: 'interaction' })
      .addNote({
        content: 'Tried eavesdropping',
        type: 'interaction',
        sensitive: true,
      })
      .addNote({ content: 'Safe travels & self control', type: 'prayer' })
      .saveDrawer()

    // Check notes have been created successfully
    cy.page('prayer')
    cy.dataCy('page-content')
      .contains('Frodo Baggins')
      .click()
    cy.dataCy('drawer-content')
      .contains('Frodo Baggins')
    cy.dataCy('drawer-content')
      .contains('eavesdropping')
      .should('not.exist')
    cy.dataCy('drawer-content')
      .contains('Safe travels')
    cy.dataCy('drawer-done').click()

    cy.page('people')
    cy.contains('Frodo').click()
    cy.dataCy('section-interactions').click()

    // Delete empty note
    cy.dataCy('section-interactions')
      .find('[data-cy=delete-note]').last()
      .click()
    // Wait for deletion
    cy.dataCy('section-interactions')
      .find('[data-cy=delete-note]')
      .should('have.length', 1)

    // Delete note with content (requires confirmation)
    cy.dataCy('section-interactions')
      .find('[data-cy=delete-note]')
      .click()
    cy.dataCy('confirm-cancel').click()
    cy.dataCy('section-interactions')
      .find('[data-cy=delete-note]')
      .click()
    cy.dataCy('confirm-confirm').click()
      .saveDrawer()

    // Check notes have been removed successfully
    cy.page('prayer')
    cy.dataCy('page-content')
      .contains('Frodo Baggins')
      .click()
    cy.dataCy('drawer-content')
      .contains('No interactions')
  })

  it('can add & edit actions', () => {
    cy.viewport(1280, 720)

    cy.createPerson({ firstName: 'Frodo', lastName: 'Baggins' })
      .addNote({ content: 'Destroy ring', type: 'action' })
      .saveDrawer()
    cy.createPerson({ firstName: 'Samwise', lastName: 'Gamgee' })
      .addNote({ content: 'Trim hedges', type: 'action' })
      .addNote({ content: 'Cook taters', type: 'action' })
      .addNote({ content: 'Bully Gollum', type: 'action', sensitive: true })
      .saveDrawer()
    cy.page('actions')
    cy.dataCy('page-content')
      .contains('Frodo Baggins').first()
      .click()
    cy.dataCy('page-content')
      .contains('Samwise Gamgee').first()
      .click()
    cy.dataCy('page-content')
      .contains('Frodo Baggins').first()
      .click()
    cy.dataCy('page-content')
      .contains('Destroy ring')
    cy.dataCy('page-content')
      .contains('Trim hedges')
    cy.dataCy('page-content')
      .contains('Cook taters')
    cy.dataCy('page-content')
      .contains('Bully gollum')
      .should('not.exist')

    cy.dataCy('page-content')
      .find('[data-cy=list-item]')
      .filter((i, e) => /samwise gamgee/i.test(e.innerText))
      .should('have.length', 3)
    cy.dataCy('page-content')
      .find('[data-cy=list-item]')
      .filter((i, e) => /frodo baggins/i.test(e.innerText))
      .should('have.length', 1)
  })

  it('can create groups; add & remove members', () => {
    cy.createPerson({ firstName: 'Frodo' })
      .saveDrawer()
    cy.createPerson({ firstName: 'Pippin' })
      .saveDrawer()
    cy.createPerson({ firstName: 'Merry' })
      .saveDrawer()
    cy.createGroup({ name: 'Fellowship of the Ring' })
      .addMember('Frodo')
      .addMember('Pippin')
      .addMember('Merry')
    cy.contains(/group report/i)
      .should('be.disabled')
      .saveDrawer()
    cy.createPerson({ firstName: 'Gandalf' })
      .addToGroup('f')
      .saveDrawer()

    cy.page('groups')
    cy.contains('4 members').click()
    cy.dataCy('section-members').click()
    cy.contains('Gandalf')
      .parentsUntil('[data-cy=list-item]')
      .parent()
      .find('[data-cy=list-item-action]')
      .click()
      .saveDrawer()
    cy.contains('3 members')
  })

  it('group report only works for existing groups', () => {
    cy.createGroup({ name: 'FotR' })
    cy.contains(/group report/i)
      .should('be.disabled')
    cy.saveDrawer()
    cy.contains('FotR').click()
    cy.contains(/group report/i)
      .should('not.be.disabled')
      .click()
    cy.dataCy('drawer-content')
      .should('have.length', 2)
  })

  it('can create other items, edit frequencies', () => {
    cy.createOther({ name: 'Athelas' })
      .dataCy('frequency-selection-prayer').click()
      .dataCy('frequency-weekly').click()
      .saveDrawer()
    cy.createOther({ name: 'Mallorn' })
      .dataCy('frequency-selection-prayer').click()
      .dataCy('frequency-annually').click()
      .saveDrawer()
    cy.createOther({ name: 'The One Ring' })
      .dataCy('frequency-selection-prayer').click()
      .dataCy('frequency-daily').click()
      .saveDrawer()

    cy.page('prayer')
    cy.dataCy('list-item').eq(0).contains('One Ring')
    cy.dataCy('list-item').eq(1).contains('Athelas')
    cy.dataCy('list-item').eq(2).contains('Mallorn')
  })

  it('can add and edit tags', () => {
    cy.createPerson({ firstName: 'Frodo' })
      .addTag('Hobbit')
      .saveDrawer()
    cy.createPerson({ firstName: 'Pippin' })
      .addTag('h')
      .saveDrawer()
    cy.createPerson({ firstName: 'Boromir' })
      .addTag('h')
      .addTag('h')  // should remove the tag "Hobbit"
      .addTag('Gondor')
      .saveDrawer()
    cy.contains('Pippin').click()
      .addTag('Gon')
      .saveDrawer()

    cy.dataCy('tag')
      .filter((i, e) => /gondor/i.test(e.innerText))
      .should('have.length', 2)
    cy.dataCy('tag')
      .filter((i, e) => /hobbit/i.test(e.innerText))
      .should('have.length', 2)
  })

  it('opening/closing nested drawers works correctly', () => {
    // Requires "desktop" width for testing the permanent-drawer mechanics
    cy.viewport(1280, 720)

    // Create some test items
    cy.createGroup({ name: 'Fellowship of the Ring' })
      .saveDrawer()
    cy.createPerson({ firstName: 'Bilbo', lastName: 'Baggins' })
    cy.createPerson({ firstName: 'Frodo', lastName: 'Baggins' })
      .addToGroup('Fellowship')

    // Open a nested drawer and edit it
    cy.contains('Fellowship').click()
    cy.dataCy('description')
      .last()
      .type('Nine vs. nine, who will win?')
      .saveDrawer()

    // Open a different drawer
    cy.contains('Bilbo').click()

    // Bilbo's drawer should not be stacked so we should now be able to change pages
    cy.page('prayer')

    // Check prayer report for Bilbo
    cy.dataCy('page-content')
      .contains('Bilbo')
      .click()
    cy.dataCy('drawer-content')
      .contains('Bilbo Baggins')
    cy.dataCy('drawer-content')
      .find('[data-cy=firstName]')
      .should('not.exist')

    // Add a prayer point for Bilbo
    cy.dataCy('edit-item-button')
      .click()
    cy.dataCy('firstName')
    cy.dataCy('section-prayer-points').click()
    cy.addNote({ type: 'prayer', content: 'Safe travels' })
      .saveDrawer()
    cy.dataCy('drawer-content')
      .first()
      .contains('Safe travels')

    // Switch to Frodo (should not nest drawer)
    cy.contains('Frodo').click()
    cy.dataCy('drawer-content')
      .first()
      .contains('Bilbo')
      .should('not.exist')
  })
})
