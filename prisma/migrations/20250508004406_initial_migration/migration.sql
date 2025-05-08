-- CreateTable
CREATE TABLE `Utilisateur` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `mot_de_passe` VARCHAR(255) NOT NULL,
    `role` ENUM('client', 'technicien', 'admin') NOT NULL,
    `nom` VARCHAR(100) NOT NULL,
    `prenom` VARCHAR(100) NOT NULL,
    `telephone` VARCHAR(20) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Utilisateur_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `utilisateur_id` INTEGER NOT NULL,
    `adresse` TEXT NULL,

    UNIQUE INDEX `Client_utilisateur_id_key`(`utilisateur_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Technicien` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `utilisateur_id` INTEGER NOT NULL,
    `specialite` VARCHAR(255) NULL,
    `disponibilite` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Technicien_utilisateur_id_key`(`utilisateur_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Scooter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `modele` VARCHAR(100) NOT NULL,
    `marque` VARCHAR(100) NOT NULL,
    `annee` INTEGER NULL,
    `numero_serie` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reparation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `scooter_id` INTEGER NOT NULL,
    `description_probleme` TEXT NULL,
    `diagnostic_ia` TEXT NULL,
    `estimation_prix` DECIMAL(10, 2) NULL,
    `statut` ENUM('a_venir', 'en_cours', 'termine') NOT NULL DEFAULT 'a_venir',
    `date_creation` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_rdv` DATETIME NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TechnicienReparation` (
    `technicien_id` INTEGER NOT NULL,
    `reparation_id` INTEGER NOT NULL,

    PRIMARY KEY (`technicien_id`, `reparation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reparation_id` INTEGER NOT NULL,
    `expediteur_id` INTEGER NOT NULL,
    `contenu` TEXT NOT NULL,
    `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Technicien` ADD CONSTRAINT `Technicien_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scooter` ADD CONSTRAINT `Scooter_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reparation` ADD CONSTRAINT `Reparation_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reparation` ADD CONSTRAINT `Reparation_scooter_id_fkey` FOREIGN KEY (`scooter_id`) REFERENCES `Scooter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TechnicienReparation` ADD CONSTRAINT `TechnicienReparation_technicien_id_fkey` FOREIGN KEY (`technicien_id`) REFERENCES `Technicien`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TechnicienReparation` ADD CONSTRAINT `TechnicienReparation_reparation_id_fkey` FOREIGN KEY (`reparation_id`) REFERENCES `Reparation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_reparation_id_fkey` FOREIGN KEY (`reparation_id`) REFERENCES `Reparation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_expediteur_id_fkey` FOREIGN KEY (`expediteur_id`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
