/**
 * Help & Support Screen
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopNavbar } from '@shared/components/TopNavbar';
import { APP_CONFIG } from '@/config/appConfig';
import { getBottomTabPadding } from '@shared/utils/screenPadding';

export const HelpSupportScreen: React.FC = () => {
    const supportOptions = [
        {
            title: APP_CONFIG.faqTitle,
            description: APP_CONFIG.faqDesc,
            icon: 'help-circle-outline' as const,
            color: '#3B82F6',
            onPress: () => APP_CONFIG.faqUrl ? Linking.openURL(APP_CONFIG.faqUrl) : {},
        },
        {
            title: APP_CONFIG.contactEmailTitle,
            description: APP_CONFIG.supportEmail,
            icon: 'mail-outline' as const,
            color: '#10B981',
            onPress: () => Linking.openURL(`mailto:${APP_CONFIG.supportEmail}`),
        },
        {
            title: APP_CONFIG.callCenterTitle,
            description: APP_CONFIG.supportPhone,
            icon: 'call-outline' as const,
            color: '#F59E0B',
            onPress: () => {
                const cleanPhone = APP_CONFIG.supportPhone.replace(/[^0-9+]/g, '');
                Linking.openURL(`tel:${cleanPhone}`);
            },
        },
        {
            title: APP_CONFIG.userGuideTitle,
            description: APP_CONFIG.userGuideDesc,
            icon: 'book-outline' as const,
            color: '#8B5CF6',
            onPress: () => APP_CONFIG.userGuideUrl ? Linking.openURL(APP_CONFIG.userGuideUrl) : {},
        },
    ];

    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <TopNavbar
                title="Help & Support"
                showBack={true}
            />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerBox}>
                    <Text style={styles.headerTitle}>{APP_CONFIG.supportSlogan}</Text>
                    <Text style={styles.headerSubtitle}>
                        {APP_CONFIG.supportSubtitle}
                    </Text>
                </View>

                <View style={styles.optionsContainer}>
                    {supportOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.optionCard}
                            onPress={option.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconBox, { backgroundColor: `${option.color}15` }]}>
                                <Ionicons name={option.icon} size={24} color={option.color} />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={styles.optionTitle}>{option.title}</Text>
                                <Text style={styles.optionDesc}>{option.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.disclaimerBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#64748B" />
                    <Text style={styles.disclaimerText}>
                        For immediate emergencies, please contact your local emergency services directly.
                    </Text>
                </View>

                <View style={{ height: getBottomTabPadding(insets, 80) }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    headerBox: {
        marginTop: 8,
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#64748B',
        lineHeight: 22,
    },
    optionsContainer: {
        gap: 12,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 2,
    },
    optionDesc: {
        fontSize: 14,
        color: '#64748B',
    },
    disclaimerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 16,
        marginTop: 32,
        gap: 12,
    },
    disclaimerText: {
        flex: 1,
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
    },
});
