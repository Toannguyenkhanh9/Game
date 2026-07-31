import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';

import {
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';

import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppReview from 'react-native-in-app-review';
import {useIAP} from 'react-native-iap';

const SHOW_ADS_AFTER_SECONDS = 45;
const REMOVE_ADS_PRODUCT_ID =
  'com.nexus.tripeaksmanor.remove_ads';

// Hỏi đánh giá sau 3 lần game gửi mốc interstitial.
// Khi chọn "Để sau", ứng dụng chờ 7 ngày mới hỏi lại.
const REVIEW_TRIGGER_COUNT = 3;
const REVIEW_REMIND_LATER_DAYS = 7;
const REVIEW_STATE_KEY =
  '@tripeaks_manor/review_state_v1';

const bannerUnitId = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-6025850831913874/7315355251';

const interstitialUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-6025850831913874/6881306643';

// Thay bằng Rewarded Ad Unit thật trước khi phát hành.
// Khi để trống, ứng dụng dùng TestIds.REWARDED.
const PROD_REWARDED_UNIT_ID = 'ca-app-pub-6025850831913874/2150199343';

const rewardedUnitId =
  __DEV__ || !PROD_REWARDED_UNIT_ID
    ? TestIds.REWARDED
    : PROD_REWARDED_UNIT_ID;

const interstitial =
  InterstitialAd.createForAdRequest(
    interstitialUnitId,
    {
      requestNonPersonalizedAdsOnly: true,
    },
  );

const rewarded =
  RewardedAd.createForAdRequest(
    rewardedUnitId,
    {
      requestNonPersonalizedAdsOnly: true,
    },
  );

function getDeviceLang() {
  try {
    const locale =
      Intl?.DateTimeFormat?.()
        .resolvedOptions?.()
        .locale || 'en';

    const languageCode =
      locale
        .toLowerCase()
        .split('-')[0];

    if (languageCode === 'tl') {
      return 'fil';
    }

    if (languageCode === 'in') {
      return 'id';
    }

    return languageCode;
  } catch {
    return 'en';
  }
}

function getTexts() {
  const lang = getDeviceLang();

  const dict = {
    removeAds: {
      vi: 'Tắt quảng cáo',
      en: 'Remove Ads',
      es: 'Quitar anuncios',
      fr: 'Supprimer les pubs',
      de: 'Werbung entfernen',
      zh: '去除广告',
      ja: '広告を削除',
      ko: '광고 제거',
      ru: 'Убрать рекламу',
      ar: 'إزالة الإعلانات',
      hi: 'विज्ञापन हटाएं',
      th: 'ลบโฆษณา',
      id: 'Hapus Iklan',
      ms: 'Buang Iklan',
      fil: 'Alisin ang Ads',
      pt: 'Remover anúncios',
    },

    restore: {
      vi: 'Khôi phục',
      en: 'Restore',
      es: 'Restaurar',
      fr: 'Restaurer',
      de: 'Wiederherstellen',
      zh: '恢复购买',
      ja: '復元',
      ko: '복원',
      ru: 'Восстановить',
      ar: 'استعادة',
      hi: 'रिस्टोर',
      th: 'กู้คืน',
      id: 'Pulihkan',
      ms: 'Pulihkan',
      fil: 'Ibalik',
      pt: 'Restaurar',
    },

    success: {
      vi: 'Bạn đã tắt quảng cáo thành công.',
      en: 'Ads removed successfully.',
      es: 'Los anuncios se eliminaron correctamente.',
      fr: 'Les publicités ont été supprimées avec succès.',
      de: 'Die Werbung wurde erfolgreich entfernt.',
      zh: '广告已成功移除。',
      ja: '広告が正常に削除されました。',
      ko: '광고가 성공적으로 제거되었습니다.',
      ru: 'Реклама успешно отключена.',
      ar: 'تمت إزالة الإعلانات بنجاح.',
      hi: 'विज्ञापन सफलतापूर्वक हटा दिए गए।',
      th: 'ลบโฆษณาเรียบร้อยแล้ว',
      id: 'Iklan berhasil dihapus.',
      ms: 'Iklan berjaya dibuang.',
      fil: 'Matagumpay na naalis ang mga ad.',
      pt: 'Os anúncios foram removidos com sucesso.',
    },

    restored: {
      vi: 'Đã khôi phục giao dịch thành công.',
      en: 'Purchases restored successfully.',
      es: 'Las compras se restauraron correctamente.',
      fr: 'Les achats ont été restaurés avec succès.',
      de: 'Käufe wurden erfolgreich wiederhergestellt.',
      zh: '购买已成功恢复。',
      ja: '購入の復元に成功しました。',
      ko: '구매가 성공적으로 복원되었습니다.',
      ru: 'Покупки успешно восстановлены.',
      ar: 'تمت استعادة المشتريات بنجاح.',
      hi: 'खरीदारी सफलतापूर्वक पुनर्स्थापित हो गई।',
      th: 'กู้คืนการซื้อเรียบร้อยแล้ว',
      id: 'Pembelian berhasil dipulihkan.',
      ms: 'Pembelian berjaya dipulihkan.',
      fil: 'Matagumpay na naibalik ang mga binili.',
      pt: 'As compras foram restauradas com sucesso.',
    },

    noPurchase: {
      vi: 'Không tìm thấy giao dịch Remove Ads.',
      en: 'No Remove Ads purchase found.',
      es: 'No se encontró ninguna compra de Remove Ads.',
      fr: 'Aucun achat Remove Ads trouvé.',
      de: 'Kein Kauf für Remove Ads gefunden.',
      zh: '未找到去广告购买记录。',
      ja: '広告削除の購入履歴が見つかりません。',
      ko: '광고 제거 구매 내역을 찾을 수 없습니다.',
      ru: 'Покупка удаления рекламы не найдена.',
      ar: 'لم يتم العثور على عملية شراء إزالة الإعلانات.',
      hi: 'विज्ञापन हटाने की कोई खरीद नहीं मिली।',
      th: 'ไม่พบรายการซื้อการลบโฆษณา',
      id: 'Pembelian Hapus Iklan tidak ditemukan.',
      ms: 'Pembelian Buang Iklan tidak ditemui.',
      fil: 'Walang nahanap na pagbili ng Remove Ads.',
      pt: 'Nenhuma compra de remoção de anúncios foi encontrada.',
    },

    unavailable: {
      vi: 'Không tìm thấy sản phẩm Remove Ads.',
      en: 'Remove Ads product not found.',
      es: 'No se encontró el producto Remove Ads.',
      fr: 'Produit Remove Ads introuvable.',
      de: 'Produkt „Remove Ads“ wurde nicht gefunden.',
      zh: '未找到去广告商品。',
      ja: '広告削除商品が見つかりません。',
      ko: '광고 제거 상품을 찾을 수 없습니다.',
      ru: 'Товар для отключения рекламы не найден.',
      ar: 'تعذر العثور على منتج إزالة الإعلانات.',
      hi: 'विज्ञापन हटाने वाला उत्पाद नहीं मिला।',
      th: 'ไม่พบสินค้าลบโฆษณา',
      id: 'Produk Hapus Iklan tidak ditemukan.',
      ms: 'Produk Buang Iklan tidak ditemui.',
      fil: 'Hindi nakita ang produktong Remove Ads.',
      pt: 'Produto de remoção de anúncios não encontrado.',
    },

    purchaseError: {
      vi: 'Không thể hoàn tất mua hàng.',
      en: 'Unable to complete purchase.',
      es: 'No se pudo completar la compra.',
      fr: 'Impossible de finaliser l’achat.',
      de: 'Der Kauf konnte nicht abgeschlossen werden.',
      zh: '无法完成购买。',
      ja: '購入を完了できませんでした。',
      ko: '구매를 완료할 수 없습니다.',
      ru: 'Не удалось завершить покупку.',
      ar: 'تعذر إتمام عملية الشراء.',
      hi: 'खरीदारी पूरी नहीं की जा सकी।',
      th: 'ไม่สามารถทำรายการซื้อให้เสร็จสมบูรณ์ได้',
      id: 'Tidak dapat menyelesaikan pembelian.',
      ms: 'Tidak dapat menyelesaikan pembelian.',
      fil: 'Hindi makumpleto ang pagbili.',
      pt: 'Não foi possível concluir a compra.',
    },
  };

  const reviewDict = {
    vi: {
      reviewTitle:
        'Bạn thích trò chơi này chứ?',
      reviewMessage:
        'Nếu bạn đang có trải nghiệm tốt, hãy dành một chút thời gian để đánh giá ứng dụng nhé.',
      reviewNow: 'Đánh giá ngay',
      reviewLater: 'Để sau',
      reviewUnavailableTitle:
        'Chưa thể mở đánh giá',
      reviewUnavailableMessage:
        'Tính năng đánh giá trong ứng dụng hiện chưa khả dụng. Bạn có thể thử lại sau.',
    },

    en: {
      reviewTitle:
        'Enjoying the game?',
      reviewMessage:
        'If you are having a good experience, please take a moment to rate the app.',
      reviewNow: 'Rate now',
      reviewLater: 'Later',
      reviewUnavailableTitle:
        'Review unavailable',
      reviewUnavailableMessage:
        'In-app review is currently unavailable. Please try again later.',
    },

    es: {
      reviewTitle:
        '¿Te está gustando el juego?',
      reviewMessage:
        'Si estás disfrutando de la experiencia, dedica un momento a calificar la aplicación.',
      reviewNow: 'Calificar ahora',
      reviewLater: 'Más tarde',
      reviewUnavailableTitle:
        'Reseña no disponible',
      reviewUnavailableMessage:
        'La valoración dentro de la aplicación no está disponible en este momento. Inténtalo de nuevo más tarde.',
    },

    fr: {
      reviewTitle:
        'Vous aimez le jeu ?',
      reviewMessage:
        'Si vous appréciez votre expérience, prenez un moment pour noter l’application.',
      reviewNow: 'Noter maintenant',
      reviewLater: 'Plus tard',
      reviewUnavailableTitle:
        'Évaluation indisponible',
      reviewUnavailableMessage:
        'L’évaluation intégrée à l’application n’est pas disponible pour le moment. Réessayez plus tard.',
    },

    de: {
      reviewTitle:
        'Gefällt dir das Spiel?',
      reviewMessage:
        'Wenn dir das Spiel gefällt, nimm dir bitte einen Moment Zeit, um die App zu bewerten.',
      reviewNow: 'Jetzt bewerten',
      reviewLater: 'Später',
      reviewUnavailableTitle:
        'Bewertung nicht verfügbar',
      reviewUnavailableMessage:
        'Die In-App-Bewertung ist derzeit nicht verfügbar. Bitte versuche es später erneut.',
    },

    zh: {
      reviewTitle:
        '喜欢这款游戏吗？',
      reviewMessage:
        '如果你喜欢这款游戏，请花一点时间为应用评分。',
      reviewNow: '立即评分',
      reviewLater: '稍后',
      reviewUnavailableTitle:
        '暂时无法评分',
      reviewUnavailableMessage:
        '应用内评分功能目前不可用，请稍后再试。',
    },

    ja: {
      reviewTitle:
        'このゲームを楽しんでいますか？',
      reviewMessage:
        'ゲームをお楽しみいただけている場合は、アプリの評価にご協力ください。',
      reviewNow: '今すぐ評価',
      reviewLater: '後で',
      reviewUnavailableTitle:
        '評価できません',
      reviewUnavailableMessage:
        'アプリ内評価は現在利用できません。後でもう一度お試しください。',
    },

    ko: {
      reviewTitle:
        '게임을 즐기고 계신가요?',
      reviewMessage:
        '게임이 마음에 드셨다면 잠시 시간을 내어 앱을 평가해 주세요.',
      reviewNow: '지금 평가',
      reviewLater: '나중에',
      reviewUnavailableTitle:
        '평가를 사용할 수 없음',
      reviewUnavailableMessage:
        '현재 앱 내 평가를 사용할 수 없습니다. 나중에 다시 시도해 주세요.',
    },

    ru: {
      reviewTitle:
        'Нравится игра?',
      reviewMessage:
        'Если вам нравится игра, уделите минуту и оцените приложение.',
      reviewNow: 'Оценить сейчас',
      reviewLater: 'Позже',
      reviewUnavailableTitle:
        'Оценка недоступна',
      reviewUnavailableMessage:
        'Оценка внутри приложения сейчас недоступна. Попробуйте позже.',
    },

    ar: {
      reviewTitle:
        'هل تستمتع باللعبة؟',
      reviewMessage:
        'إذا كنت تستمتع بالتجربة، نرجو تخصيص لحظة لتقييم التطبيق.',
      reviewNow: 'قيّم الآن',
      reviewLater: 'لاحقًا',
      reviewUnavailableTitle:
        'التقييم غير متاح',
      reviewUnavailableMessage:
        'التقييم داخل التطبيق غير متاح حاليًا. يُرجى المحاولة مرة أخرى لاحقًا.',
    },

    hi: {
      reviewTitle:
        'क्या आपको यह गेम पसंद आ रहा है?',
      reviewMessage:
        'अगर आपको यह अनुभव पसंद आ रहा है, तो कृपया ऐप को रेट करने के लिए थोड़ा समय दें।',
      reviewNow: 'अभी रेट करें',
      reviewLater: 'बाद में',
      reviewUnavailableTitle:
        'रेटिंग उपलब्ध नहीं है',
      reviewUnavailableMessage:
        'इन-ऐप रेटिंग अभी उपलब्ध नहीं है। कृपया बाद में फिर कोशिश करें।',
    },

    th: {
      reviewTitle:
        'สนุกกับเกมนี้อยู่ไหม?',
      reviewMessage:
        'หากคุณชอบประสบการณ์นี้ กรุณาสละเวลาสักครู่เพื่อให้คะแนนแอป',
      reviewNow: 'ให้คะแนนตอนนี้',
      reviewLater: 'ไว้ภายหลัง',
      reviewUnavailableTitle:
        'ไม่สามารถให้คะแนนได้',
      reviewUnavailableMessage:
        'ขณะนี้ระบบให้คะแนนภายในแอปยังไม่พร้อมใช้งาน โปรดลองอีกครั้งภายหลัง',
    },

    id: {
      reviewTitle:
        'Menikmati game ini?',
      reviewMessage:
        'Jika Anda menikmati pengalaman ini, luangkan waktu sejenak untuk memberi rating pada aplikasi.',
      reviewNow: 'Beri rating sekarang',
      reviewLater: 'Nanti',
      reviewUnavailableTitle:
        'Rating tidak tersedia',
      reviewUnavailableMessage:
        'Rating dalam aplikasi saat ini tidak tersedia. Silakan coba lagi nanti.',
    },

    ms: {
      reviewTitle:
        'Menikmati permainan ini?',
      reviewMessage:
        'Jika anda menikmati pengalaman ini, luangkan sedikit masa untuk menilai aplikasi.',
      reviewNow: 'Nilai sekarang',
      reviewLater: 'Nanti',
      reviewUnavailableTitle:
        'Penilaian tidak tersedia',
      reviewUnavailableMessage:
        'Penilaian dalam aplikasi tidak tersedia buat masa ini. Sila cuba lagi kemudian.',
    },

    fil: {
      reviewTitle:
        'Nag-e-enjoy ka ba sa laro?',
      reviewMessage:
        'Kung nagugustuhan mo ang karanasan, maglaan ng sandali para i-rate ang app.',
      reviewNow: 'I-rate ngayon',
      reviewLater: 'Mamaya',
      reviewUnavailableTitle:
        'Hindi available ang rating',
      reviewUnavailableMessage:
        'Hindi available sa ngayon ang in-app rating. Pakisubukan muli mamaya.',
    },

    pt: {
      reviewTitle:
        'Está gostando do jogo?',
      reviewMessage:
        'Se estiver gostando da experiência, reserve um momento para avaliar o aplicativo.',
      reviewNow: 'Avaliar agora',
      reviewLater: 'Mais tarde',
      reviewUnavailableTitle:
        'Avaliação indisponível',
      reviewUnavailableMessage:
        'A avaliação no aplicativo não está disponível no momento. Tente novamente mais tarde.',
    },
  };

  const review =
    reviewDict[lang] ||
    reviewDict.en;

  return {
    removeAds:
      dict.removeAds[lang] ||
      dict.removeAds.en,

    restore:
      dict.restore[lang] ||
      dict.restore.en,

    success:
      dict.success[lang] ||
      dict.success.en,

    restored:
      dict.restored[lang] ||
      dict.restored.en,

    noPurchase:
      dict.noPurchase[lang] ||
      dict.noPurchase.en,

    unavailable:
      dict.unavailable[lang] ||
      dict.unavailable.en,

    purchaseError:
      dict.purchaseError[lang] ||
      dict.purchaseError.en,

    ...review,
  };
}

function parseGameMessage(rawData) {
  try {
    return JSON.parse(rawData);
  } catch {
    return {
      type: rawData,
      requestId:
        `legacy_${Date.now()}`,
    };
  }
}

function getProductId(item) {
  return (
    item?.productId ||
    item?.id ||
    item?.productIds?.[0] ||
    ''
  );
}

function isUserCancelled(error) {
  const value = String(
    error?.code ||
      error?.message ||
      '',
  ).toLowerCase();

  return (
    value.includes('cancel') ||
    value.includes('user-cancelled') ||
    value.includes('user_cancelled')
  );
}

export default function Main() {
  const webViewRef = useRef(null);
  const secondsRef = useRef(0);

  const interstitialLoadedRef =
    useRef(false);

  const rewardedLoadedRef =
    useRef(false);

  const adShowingRef =
    useRef(false);

  const rewardedEarnedRef =
    useRef(false);

  const pendingInterstitialResolveRef =
    useRef(null);

  const pendingRewardedResolveRef =
    useRef(null);

  const reviewPromptVisibleRef =
    useRef(false);

  // useIAP nhận callback trước khi trả ra finishTransaction,
  // nên dùng ref để callback luôn gọi đúng hàm mới nhất.
  const finishTransactionRef =
    useRef(null);

  const [
    hasRemovedAds,
    setHasRemovedAds,
  ] = useState(false);

  const [
    buying,
    setBuying,
  ] = useState(false);

  const text = getTexts();

  const resolveInterstitialRequest =
    useCallback(success => {
      const resolve =
        pendingInterstitialResolveRef.current;

      pendingInterstitialResolveRef.current =
        null;

      if (resolve) {
        resolve(Boolean(success));
      }
    }, []);

  const resolveRewardedRequest =
    useCallback(earnedReward => {
      const resolve =
        pendingRewardedResolveRef.current;

      pendingRewardedResolveRef.current =
        null;

      if (resolve) {
        resolve(
          Boolean(earnedReward),
        );
      }
    }, []);

  const {
    connected: iapReady,
    products,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    getAvailablePurchases,
  } = useIAP({
    onPurchaseSuccess:
      async purchase => {
        try {
          console.log(
            'Purchase success:',
            purchase,
          );

          const productId =
            getProductId(purchase);

          if (
            productId !==
            REMOVE_ADS_PRODUCT_ID
          ) {
            return;
          }

          const finish =
            finishTransactionRef.current;

          if (
            typeof finish ===
            'function'
          ) {
            await finish({
              purchase,
              isConsumable: false,
            });
          }

          setHasRemovedAds(true);

          interstitialLoadedRef.current =
            false;

          adShowingRef.current =
            false;

          resolveInterstitialRequest(
            true,
          );

          Alert.alert(
            'Success',
            text.success,
          );
        } catch (error) {
          console.log(
            'finishTransaction error:',
            error,
          );

          Alert.alert(
            'Error',
            error?.message ||
              text.purchaseError,
          );
        } finally {
          setBuying(false);
        }
      },

    onPurchaseError: error => {
      console.log(
        'Purchase error:',
        error,
      );

      setBuying(false);

      if (!isUserCancelled(error)) {
        Alert.alert(
          'Error',
          error?.message ||
            text.purchaseError,
        );
      }
    },
  });

  useEffect(() => {
    finishTransactionRef.current =
      finishTransaction;
  }, [finishTransaction]);

  const sendNativeAdResult =
    useCallback(result => {
      const serialized =
        JSON.stringify(result);

      webViewRef.current
        ?.injectJavaScript(`
          (function () {
            var result = ${serialized};

            if (
              typeof window.__TRIPEAKS_NATIVE_AD_RESULT__ ===
              'function'
            ) {
              window.__TRIPEAKS_NATIVE_AD_RESULT__(
                result
              );
            }

            window.dispatchEvent(
              new CustomEvent(
                'native-ad-result',
                {
                  detail: result
                }
              )
            );
          })();

          true;
        `);
    }, []);

  const requestStoreReview =
    useCallback(async () => {
      try {
        if (
          !InAppReview.isAvailable()
        ) {
          Alert.alert(
            text.reviewUnavailableTitle,
            text.reviewUnavailableMessage,
          );

          return;
        }

        await InAppReview
          .RequestInAppReview();
      } catch (error) {
        console.log(
          'InAppReview error:',
          error,
        );

        Alert.alert(
          text.reviewUnavailableTitle,
          text.reviewUnavailableMessage,
        );
      }
    }, [
      text.reviewUnavailableMessage,
      text.reviewUnavailableTitle,
    ]);

  const recordProgressAndMaybeAskForReview =
    useCallback(async () => {
      if (
        reviewPromptVisibleRef.current
      ) {
        return;
      }

      try {
        const now = Date.now();

        const rawState =
          await AsyncStorage.getItem(
            REVIEW_STATE_KEY,
          );

        let state = {
          completed: false,
          progressCount: 0,
          nextPromptAt: 0,
        };

        if (rawState) {
          try {
            state = {
              ...state,
              ...JSON.parse(rawState),
            };
          } catch (parseError) {
            console.log(
              'Review state parse error:',
              parseError,
            );
          }
        }

        if (state.completed) {
          return;
        }

        state.progressCount += 1;

        if (
          state.progressCount <
            REVIEW_TRIGGER_COUNT ||
          now <
            Number(
              state.nextPromptAt ||
                0,
            )
        ) {
          await AsyncStorage.setItem(
            REVIEW_STATE_KEY,
            JSON.stringify(state),
          );

          return;
        }

        reviewPromptVisibleRef.current =
          true;

        state.progressCount = 0;

        state.nextPromptAt =
          now +
          REVIEW_REMIND_LATER_DAYS *
            24 *
            60 *
            60 *
            1000;

        await AsyncStorage.setItem(
          REVIEW_STATE_KEY,
          JSON.stringify(state),
        );

        setTimeout(() => {
          Alert.alert(
            text.reviewTitle,
            text.reviewMessage,
            [
              {
                text:
                  text.reviewLater,

                style: 'cancel',

                onPress: () => {
                  reviewPromptVisibleRef.current =
                    false;
                },
              },

              {
                text:
                  text.reviewNow,

                onPress:
                  async () => {
                    try {
                      await AsyncStorage
                        .setItem(
                          REVIEW_STATE_KEY,
                          JSON.stringify({
                            ...state,
                            completed:
                              true,
                          }),
                        );

                      await requestStoreReview();
                    } finally {
                      reviewPromptVisibleRef.current =
                        false;
                    }
                  },
              },
            ],
            {
              cancelable: true,

              onDismiss: () => {
                reviewPromptVisibleRef.current =
                  false;
              },
            },
          );
        }, 500);
      } catch (error) {
        reviewPromptVisibleRef.current =
          false;

        console.log(
          'Review prompt error:',
          error,
        );
      }
    }, [
      requestStoreReview,
      text.reviewLater,
      text.reviewMessage,
      text.reviewNow,
      text.reviewTitle,
    ]);

  const loadOwnedPurchases =
    useCallback(async () => {
      if (!iapReady) {
        return false;
      }

      try {
        const purchases =
          await getAvailablePurchases();

        const hasRemoveAds =
          purchases.some(item => {
            return (
              getProductId(item) ===
              REMOVE_ADS_PRODUCT_ID
            );
          });

        setHasRemovedAds(
          hasRemoveAds,
        );

        return hasRemoveAds;
      } catch (error) {
        console.log(
          'getAvailablePurchases error:',
          error,
        );

        return false;
      }
    }, [
      getAvailablePurchases,
      iapReady,
    ]);

  useEffect(() => {
    const timer = setInterval(
      () => {
        secondsRef.current += 1;
      },
      1000,
    );

    return () =>
      clearInterval(timer);
  }, []);

  // react-native-iap 15.x:
  // useIAP tự quản lý kết nối và listener.
  useEffect(() => {
    if (!iapReady) {
      return;
    }

    let cancelled = false;

    const initializeIap =
      async () => {
        try {
          await fetchProducts({
            skus: [
              REMOVE_ADS_PRODUCT_ID,
            ],
            type: 'in-app',
          });

          if (!cancelled) {
            await loadOwnedPurchases();
          }
        } catch (error) {
          console.log(
            'Initialize IAP error:',
            error,
          );
        }
      };

    initializeIap();

    return () => {
      cancelled = true;
    };
  }, [
    fetchProducts,
    iapReady,
    loadOwnedPurchases,
  ]);

  // Interstitial không phụ thuộc kết nối IAP.
  useEffect(() => {
    if (hasRemovedAds) {
      interstitialLoadedRef.current =
        false;

      return;
    }

    const unsubscribeLoaded =
      interstitial.addAdEventListener(
        AdEventType.LOADED,
        () => {
          interstitialLoadedRef.current =
            true;

          console.log(
            'Interstitial loaded',
          );
        },
      );

    const unsubscribeClosed =
      interstitial.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          interstitialLoadedRef.current =
            false;

          adShowingRef.current =
            false;

          secondsRef.current = 0;

          resolveInterstitialRequest(
            true,
          );

          if (!hasRemovedAds) {
            interstitial.load();
          }
        },
      );

    const unsubscribeError =
      interstitial.addAdEventListener(
        AdEventType.ERROR,
        error => {
          console.log(
            'Interstitial error:',
            error,
          );

          interstitialLoadedRef.current =
            false;

          adShowingRef.current =
            false;

          resolveInterstitialRequest(
            false,
          );

          if (!hasRemovedAds) {
            interstitial.load();
          }
        },
      );

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [
    hasRemovedAds,
    resolveInterstitialRequest,
  ]);

  // Rewarded vẫn hoạt động sau khi mua Remove Ads,
  // vì đây là quảng cáo tự nguyện để nhận phần thưởng.
  useEffect(() => {
    const unsubscribeLoaded =
      rewarded.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          rewardedLoadedRef.current =
            true;

          console.log(
            'Rewarded loaded',
          );
        },
      );

    const unsubscribeEarned =
      rewarded.addAdEventListener(
        RewardedAdEventType
          .EARNED_REWARD,
        rewardItem => {
          console.log(
            'Reward earned:',
            rewardItem,
          );

          rewardedEarnedRef.current =
            true;
        },
      );

    const unsubscribeClosed =
      rewarded.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          const earnedReward =
            rewardedEarnedRef.current;

          rewardedLoadedRef.current =
            false;

          rewardedEarnedRef.current =
            false;

          adShowingRef.current =
            false;

          resolveRewardedRequest(
            earnedReward,
          );

          rewarded.load();
        },
      );

    const unsubscribeError =
      rewarded.addAdEventListener(
        AdEventType.ERROR,
        error => {
          console.log(
            'Rewarded error:',
            error,
          );

          rewardedLoadedRef.current =
            false;

          rewardedEarnedRef.current =
            false;

          adShowingRef.current =
            false;

          resolveRewardedRequest(
            false,
          );

          rewarded.load();
        },
      );

    rewarded.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [resolveRewardedRequest]);

  const showInterstitialAd =
    useCallback(() => {
      return new Promise(resolve => {
        // Đã mua Remove Ads:
        // bỏ qua interstitial nhưng trả true
        // để game tiếp tục.
        if (hasRemovedAds) {
          resolve(true);
          return;
        }

        if (
          secondsRef.current <
          SHOW_ADS_AFTER_SECONDS
        ) {
          resolve(false);
          return;
        }

        if (
          adShowingRef.current
        ) {
          resolve(false);
          return;
        }

        if (
          !interstitialLoadedRef.current
        ) {
          interstitial.load();
          resolve(false);
          return;
        }

        pendingInterstitialResolveRef.current =
          resolve;

        adShowingRef.current =
          true;

        interstitial
          .show()
          .catch(error => {
            console.log(
              'Interstitial show error:',
              error,
            );

            adShowingRef.current =
              false;

            interstitialLoadedRef.current =
              false;

            resolveInterstitialRequest(
              false,
            );

            interstitial.load();
          });
      });
    }, [
      hasRemovedAds,
      resolveInterstitialRequest,
    ]);

  const showRewardedAd =
    useCallback(() => {
      return new Promise(resolve => {
        if (
          adShowingRef.current
        ) {
          resolve(false);
          return;
        }

        if (
          !rewardedLoadedRef.current
        ) {
          rewarded.load();
          resolve(false);
          return;
        }

        pendingRewardedResolveRef.current =
          resolve;

        rewardedEarnedRef.current =
          false;

        adShowingRef.current =
          true;

        rewarded
          .show()
          .catch(error => {
            console.log(
              'Rewarded show error:',
              error,
            );

            adShowingRef.current =
              false;

            rewardedLoadedRef.current =
              false;

            rewardedEarnedRef.current =
              false;

            resolveRewardedRequest(
              false,
            );

            rewarded.load();
          });
      });
    }, [resolveRewardedRequest]);

  const handleRemoveAdsPurchase =
    useCallback(async () => {
      if (
        buying ||
        hasRemovedAds
      ) {
        return;
      }

      if (!iapReady) {
        Alert.alert(
          'Error',
          text.purchaseError,
        );

        return;
      }

      try {
        setBuying(true);

        const found =
          products.some(
            product =>
              getProductId(
                product,
              ) ===
              REMOVE_ADS_PRODUCT_ID,
          );

        if (!found) {
          const fetched =
            await fetchProducts({
              skus: [
                REMOVE_ADS_PRODUCT_ID,
              ],
              type: 'in-app',
            });

          if (
            Array.isArray(fetched) &&
            fetched.length > 0 &&
            !fetched.some(
              item =>
                getProductId(
                  item,
                ) ===
                REMOVE_ADS_PRODUCT_ID,
            )
          ) {
            setBuying(false);

            Alert.alert(
              'Error',
              text.unavailable,
            );

            return;
          }
        }

        await requestPurchase({
          request: {
            apple: {
              sku:
                REMOVE_ADS_PRODUCT_ID,
            },

            google: {
              skus: [
                REMOVE_ADS_PRODUCT_ID,
              ],
            },
          },

          type: 'in-app',
        });
      } catch (error) {
        console.log(
          'requestPurchase error:',
          error,
        );

        setBuying(false);

        if (
          !isUserCancelled(error)
        ) {
          Alert.alert(
            'Error',
            error?.message ||
              text.purchaseError,
          );
        }
      }
    }, [
      buying,
      fetchProducts,
      hasRemovedAds,
      iapReady,
      products,
      requestPurchase,
      text.purchaseError,
      text.unavailable,
    ]);

  const handleRestorePurchases =
    useCallback(async () => {
      if (!iapReady) {
        Alert.alert(
          'Info',
          text.purchaseError,
        );

        return;
      }

      const hasOwned =
        await loadOwnedPurchases();

      if (hasOwned) {
        interstitialLoadedRef.current =
          false;

        adShowingRef.current =
          false;

        resolveInterstitialRequest(
          true,
        );

        Alert.alert(
          'Success',
          text.restored,
        );
      } else {
        Alert.alert(
          'Info',
          text.noPurchase,
        );
      }
    }, [
      iapReady,
      loadOwnedPurchases,
      resolveInterstitialRequest,
      text.noPurchase,
      text.purchaseError,
      text.restored,
    ]);

  const onMessageReturn =
    useCallback(
      async event => {
        const rawData =
          event.nativeEvent.data;

        const message =
          parseGameMessage(
            rawData,
          );

        console.log(
          'Message from WebView:',
          message,
        );

        if (
          message.type ===
          'SHOW_REWARDED_AD'
        ) {
          const earnedReward =
            await showRewardedAd();

          sendNativeAdResult({
            requestId:
              message.requestId,

            type:
              'REWARDED_AD_RESULT',

            adType:
              'rewarded',

            success:
              earnedReward,

            rewarded:
              earnedReward,
          });

          return;
        }

        if (
          message.type ===
          'SHOW_INTERSTITIAL_AD'
        ) {
          const shown =
            await showInterstitialAd();

          sendNativeAdResult({
            requestId:
              message.requestId,

            type:
              'INTERSTITIAL_AD_RESULT',

            adType:
              'interstitial',

            success:
              shown,

            rewarded:
              false,
          });

          await recordProgressAndMaybeAskForReview();

          return;
        }

        console.log(
          'Ignored WebView message:',
          rawData,
        );
      },
      [
        recordProgressAndMaybeAskForReview,
        sendNativeAdResult,
        showInterstitialAd,
        showRewardedAd,
      ],
    );

  return (
    <View style={styles.root}>
      <View style={styles.gameContainer}>
        <WebView
          ref={webViewRef}
          style={styles.webView}
          originWhitelist={['*']}
          source={{
            uri:
              'file:///android_asset/index.html',
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowContentAccess={true}
          allowUniversalAccessFromFileURLs={
            true
          }
          allowFileAccessFromFileURLs={
            true
          }
          mixedContentMode="always"
          javaScriptCanOpenWindowsAutomatically={
            true
          }
          mediaPlaybackRequiresUserAction={
            false
          }
          setSupportMultipleWindows={
            false
          }
          androidLayerType="hardware"
          onMessage={
            onMessageReturn
          }
        />

        {!hasRemovedAds ? (
          <View
            style={
              styles.topRightBox
            }>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.removeAdsBtn,
                buying ||
                !iapReady
                  ? styles.disabledBtn
                  : null,
              ]}
              onPress={
                handleRemoveAdsPurchase
              }
              disabled={
                buying ||
                !iapReady
              }>
              <Text
                style={
                  styles.removeAdsText
                }>
                {buying
                  ? '...'
                  : text.removeAds}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.restoreBtn,
                !iapReady
                  ? styles.disabledBtn
                  : null,
              ]}
              onPress={
                handleRestorePurchases
              }
              disabled={!iapReady}>
              <Text
                style={
                  styles.restoreText
                }>
                {text.restore}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* {!hasRemovedAds ? (
        <BannerAd
          unitId={bannerUnitId}
          size={
            BannerAdSize
              .ANCHORED_ADAPTIVE_BANNER
          }
          requestOptions={{
            requestNonPersonalizedAdsOnly:
              true,
          }}
        />
      ) : null} */}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  gameContainer: {
    flex: 1,
  },

  webView: {
    flex: 1,
  },

  topRightBox: {
    position: 'absolute',
    top: 16,
    right: 8,
    zIndex: 9999,
    alignItems: 'flex-end',
  },

  removeAdsBtn: {
    backgroundColor: '#111',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 6,
  },

  disabledBtn: {
    opacity: 0.65,
  },

  removeAdsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  restoreBtn: {
    marginTop: 8,
    backgroundColor: '#ffffffee',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 4,
  },

  restoreText: {
    color: '#111',
    fontSize: 13,
    fontWeight: '700',
  },
});
