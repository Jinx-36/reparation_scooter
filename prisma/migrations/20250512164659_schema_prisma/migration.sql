/*
  Warnings:

  - You are about to alter the column `date` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `date_creation` on the `Reparation` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `date_rdv` on the `Reparation` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `email` on the `Utilisateur` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `mot_de_passe` on the `Utilisateur` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- DropForeignKey
ALTER TABLE `Client` DROP FOREIGN KEY `Client_utilisateur_id_fkey`;

-- DropForeignKey
ALTER TABLE `Scooter` DROP FOREIGN KEY `Scooter_client_id_fkey`;

-- DropIndex
DROP INDEX `Scooter_client_id_fkey` ON `Scooter`;

-- AlterTable
ALTER TABLE `Client` MODIFY `adresse` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Message` MODIFY `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Reparation` MODIFY `date_creation` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `date_rdv` DATETIME NULL;

-- AlterTable
ALTER TABLE `Scooter` MODIFY `modele` VARCHAR(191) NOT NULL,
    MODIFY `marque` VARCHAR(191) NOT NULL,
    MODIFY `numero_serie` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Utilisateur` MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `mot_de_passe` VARCHAR(191) NOT NULL,
    MODIFY `role` ENUM('client', 'technicien', 'admin') NOT NULL DEFAULT 'client',
    MODIFY `nom` VARCHAR(191) NOT NULL,
    MODIFY `prenom` VARCHAR(191) NOT NULL,
    MODIFY `telephone` VARCHAR(191) NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scooter` ADD CONSTRAINT `Scooter_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
