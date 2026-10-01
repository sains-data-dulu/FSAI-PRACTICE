# ==================================================================
# Soal Latihan Clustering, PCA & MCA — kode lengkap (Soal 1–3)
# Paket: insuranceData, factoextra, FactoMineR, cluster
# Data juga tersedia sebagai CSV: soal1_kelas_pekerjaan.csv, soal2_autobi.csv, soal3_negara_bagian.csv
# ==================================================================
library(insuranceData); library(factoextra); library(FactoMineR); library(cluster)

# ---------------- SOAL 1 (EASY): WorkersComp ----------------
data(WorkersComp)
kelas <- do.call(rbind, lapply(split(WorkersComp, WorkersComp$CL), function(x) {
  lr <- x$LOSS / x$PR * 100
  data.frame(kelas = x$CL[1], payroll = mean(x$PR) / 1e6,
             loss_rate = sum(x$LOSS) / sum(x$PR) * 100,
             volatilitas = sd(lr) / mean(lr)) }))
kelas <- kelas[is.finite(kelas$volatilitas) & kelas$payroll > 0.5, ]   # 117 kelas
summary(kelas[, -1])
kelas$log_payroll <- log10(kelas$payroll)
X1 <- scale(kelas[, c("log_payroll", "loss_rate", "volatilitas")])
wss <- sapply(1:8, function(k) { set.seed(1); kmeans(X1, k, nstart = 25)$tot.withinss })
plot(1:8, wss, type = "b", xlab = "Jumlah Cluster (k)", ylab = "Total Within Sum of Squares")
set.seed(123); km1 <- kmeans(X1, 3, nstart = 25); km1
aggregate(kelas[, c("payroll", "loss_rate", "volatilitas")], list(cluster = km1$cluster), median)
fviz_cluster(km1, data = X1)
hc1 <- hclust(dist(X1), method = "ward.D2"); plot(hc1, labels = FALSE, hang = -1); rect.hclust(hc1, 3)

# ---------------- SOAL 2 (MEDIUM): AutoBi ----------------
data(AutoBi)
str(AutoBi); colSums(is.na(AutoBi)); summary(AutoBi$LOSS)
b <- na.omit(AutoBi)                                             # 1.091 klaim
klaim <- data.frame(
  pengacara = factor(ifelse(b$ATTORNEY == 1, "Ya", "Tidak")),
  gender    = factor(ifelse(b$CLMSEX == 1, "Pria", "Wanita")),
  status    = factor(c("Menikah", "Lajang", "Janda/Duda", "Cerai")[b$MARITAL]),
  usia      = b$CLMAGE,
  log_loss  = log10(b$LOSS + 0.01))
table(b$SEATBELT); table(b$CLMINSUR)
gd  <- daisy(klaim, metric = "gower")
sil <- sapply(2:8, function(k) pam(gd, k, diss = TRUE)$silinfo$avg.width); round(sil, 3)
pam3 <- pam(gd, k = 3, diss = TRUE)
table(pam3$clustering)
klaim[pam3$id.med, ]
tapply(b$LOSS, pam3$clustering, median); tapply(b$CLMAGE, pam3$clustering, median)
round(prop.table(table(pam3$clustering, klaim$pengacara), 1) * 100, 1)
m <- data.frame(pengacara = klaim$pengacara, gender = klaim$gender, status = klaim$status,
  sabuk = factor(ifelse(b$SEATBELT == 1, "Pakai", "TidakPakai")),
  usia  = cut(b$CLMAGE, c(-Inf, 25, 50, Inf), labels = c("<=25", "26-50", ">50")),
  loss  = cut(b$LOSS, c(-Inf, 1, 5, Inf), labels = c("Kecil", "Sedang", "Besar")))
res.mca <- MCA(m, graph = FALSE)
res.mca$eig[1:4, ]; res.mca$var$eta2[, 1:2]
fviz_mca_var(res.mca, repel = TRUE)

# ---------------- SOAL 3 (HARD): state.x77 ----------------
negara <- as.data.frame(state.x77)
names(negara) <- c("Populasi", "Pendapatan", "Buta_huruf", "Harapan_hidup",
                   "Pembunuhan", "Lulus_SMA", "Hari_beku", "Luas")
summary(negara)
ss <- sapply(negara, function(x) sum((x - mean(x))^2)); round(ss / sum(ss) * 100, 2)
set.seed(1); km_raw <- kmeans(negara, 3, nstart = 25); split(rownames(negara), km_raw$cluster)
res.pca <- prcomp(negara, scale = TRUE)
round(res.pca$sdev, 4); get_eigenvalue(res.pca); round(res.pca$rotation[, 1:2], 3)
X3 <- scale(negara)
fviz_nbclust(X3, kmeans, method = "wss", nstart = 50)
fviz_nbclust(X3, kmeans, method = "silhouette", nstart = 50)
hc3 <- hclust(dist(X3), "ward.D2"); plot(hc3, hang = -1); round(rev(hc3$height)[1:6], 2)
set.seed(1); km4 <- kmeans(X3, 4, nstart = 50)
split(rownames(negara), km4$cluster)
ind <- get_pca_ind(res.pca)$coord
round(ind[c("California", "Alaska", "Mississippi", "Minnesota"), 1:2], 2)
fviz_pca_biplot(res.pca, habillage = factor(km4$cluster), repel = TRUE)
negara6 <- negara[, !(names(negara) %in% c("Populasi", "Luas"))]
get_eigenvalue(prcomp(negara6, scale = TRUE))
set.seed(1); km6 <- kmeans(scale(negara6), 4, nstart = 50)
c(delapan = km4$betweenss / km4$totss, enam = km6$betweenss / km6$totss); table(km6$cluster)
aggregate(negara, list(cluster = km4$cluster), mean)
