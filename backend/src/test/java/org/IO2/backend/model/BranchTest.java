package org.IO2.backend.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class BranchTest {

    @Test
    void shouldCreateBranchWithBuilder() {
        String name = "Branch Warszawa";
        String address = "ul. Marszałkowska 1, 00-000 Warszawa";
        String type = "DISTRIBUTION_CENTER";

        Branch branch = Branch.builder()
                .name(name)
                .address(address)
                .type(type)
                .build();

        assertNotNull(branch);
        assertEquals(name, branch.getName());
        assertEquals(address, branch.getAddress());
        assertEquals(type, branch.getType());
    }

    @Test
    void shouldSetAndGetBranchId() {
        Long id = 1L;
        Branch branch = Branch.builder()
                .id(id)
                .name("Branch Kraków")
                .address("ul. Floriańska 1, 31-019 Kraków")
                .type("COLLECTION_POINT")
                .build();

        assertEquals(id, branch.getId());
    }

    @Test
    void shouldAllowModifyingBranchFields() {
        Branch branch = Branch.builder()
                .name("Original Name")
                .address("Original Address")
                .type("PICKUP_POINT")
                .build();

        branch.setName("Updated Name");
        branch.setAddress("Updated Address");
        branch.setType("DISTRIBUTION_CENTER");

        assertEquals("Updated Name", branch.getName());
        assertEquals("Updated Address", branch.getAddress());
        assertEquals("DISTRIBUTION_CENTER", branch.getType());
    }

    @Test
    void shouldCreateBranchWithNoArgsConstructor() {
        Branch branch = new Branch();

        assertNotNull(branch);
    }

    @Test
    void shouldCreateBranchWithAllArgsConstructor() {
        Long id = 2L;
        String name = "Branch Gdańsk";
        String address = "ul. Długa 1, 80-800 Gdańsk";
        String type = "SORTING_CENTER";

        Branch branch = new Branch(id, name, address, type);

        assertEquals(id, branch.getId());
        assertEquals(name, branch.getName());
        assertEquals(address, branch.getAddress());
        assertEquals(type, branch.getType());
    }
}

