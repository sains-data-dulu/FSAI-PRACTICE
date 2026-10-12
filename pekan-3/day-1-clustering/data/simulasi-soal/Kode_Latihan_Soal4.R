# Soal Latihan 4 - Clustering & PCA pada Data Besar (50.000 polis)
# Letakkan soal4_polis_prancis_50rb.csv di working directory

library(factoextra); library(cluster); library(ggplot2)
polis <- read.csv("soal4_polis_prancis_50rb.csv", stringsAsFactors = TRUE)
# (a) audit & cleaning
str(polis); summary(polis)
sum(polis$exposure > 1); sum(polis$usia_kend > 30)
sum(duplicated(polis$id_polis)); sum(is.na(polis)); mean(polis$jml_klaim > 0)
polis$exposure      <- pmin(polis$exposure, 1)
polis$usia_kend     <- pmin(polis$usia_kend, 30)
polis$log_kepadatan <- log10(polis$kepadatan)
vnum <- c("tenaga_kend","usia_kend","usia_pengemudi","bonus_malus","log_kepadatan")
X <- scale(polis[, vnum])
# (b) ukuran matriks jarak (GB) -> tidak dijalankan pada data penuh
nrow(X) * (nrow(X) - 1) / 2 * 8 / 1e9
# (c) elbow (data penuh) & silhouette (sampel)
system.time(wss <- sapply(1:10, function(k) kmeans(X, k, nstart = 10, iter.max = 50)$tot.withinss))
plot(1:10, wss, type = "b")
set.seed(7); idx <- sample(nrow(X), 5000); dsamp <- dist(X[idx, ])
sil <- sapply(2:8, function(k) { km <- kmeans(X, k, nstart = 10, iter.max = 50)
  mean(silhouette(km$cluster[idx], dsamp)[, 3]) }); sil
# (d) K-Means k = 4 + profiling
set.seed(123); km <- kmeans(X, 4, nstart = 25, iter.max = 50)
o <- order(km$centers[, "bonus_malus"])            # urutkan: C1 = BM terendah
km$cluster <- match(km$cluster, o); km$centers <- km$centers[o, ]; km$size <- km$size[o]
km$size; round(km$centers, 3); km$betweenss / km$totss
polis$cluster <- factor(km$cluster)
aggregate(polis[, c(vnum[-5], "kepadatan")], list(cluster = polis$cluster), median)
round(prop.table(table(polis$area, polis$cluster), 1) * 100, 1)
round(prop.table(table(polis$bbm,  polis$cluster), 1) * 100, 1)
# (e) PCA
res.pca <- prcomp(polis[, vnum], scale = TRUE)
res.pca$sdev^2; get_eigenvalue(res.pca); round(res.pca$rotation[, 1:2], 3)
aggregate(as.data.frame(res.pca$x[, 1:2]), list(cl = polis$cluster), mean)
set.seed(3); ip <- sample(nrow(polis), 4000)     # plot cukup pakai sampel
fviz_pca_biplot(res.pca, select.ind = list(name = as.character(ip)),
                habillage = polis$cluster, geom.ind = "point", label = "var")
# (f) frekuensi, severitas, pure premium per cluster
eksp  <- tapply(polis$exposure,    polis$cluster, sum)
klaim <- tapply(polis$jml_klaim,   polis$cluster, sum)
biaya <- tapply(polis$biaya_klaim, polis$cluster, sum)
pp_port <- sum(polis$biaya_klaim) / sum(polis$exposure)
data.frame(frekuensi = klaim / eksp, severitas = biaya / klaim,
           pure_premium = biaya / eksp, relatif = (biaya / eksp) / pp_port)
# (g) stabilitas pada 3 sampel 5.000 (proporsi %)
for (r in 1:3) { set.seed(100 + r); ii <- sample(nrow(X), 5000)
  kk <- kmeans(X[ii, ], 4, nstart = 25); print(round(sort(kk$size) / 50, 1)) }
