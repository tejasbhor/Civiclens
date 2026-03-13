/**
 * Legal Screen
 * Displays Terms of Use or Privacy Policy
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopNavbar } from '@shared/components/TopNavbar';
import { getBottomTabPadding } from '@shared/utils/screenPadding';

type LegalRouteProp = RouteProp<{
    Legal: { type: 'terms' | 'privacy' };
}, 'Legal'>;

export const LegalScreen: React.FC = () => {
    const route = useRoute<LegalRouteProp>();
    const insets = useSafeAreaInsets();
    const { type = 'terms' } = route.params || {};

    const isTerms = type === 'terms';
    const title = isTerms ? 'Terms of Use' : 'Privacy Policy';

    return (
        <View style={styles.container}>
            <TopNavbar
                title={title}
                showBack={true}
            />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentCard}>
                    <Text style={styles.lastUpdated}>Last Updated: June 1, 2024</Text>

                    <Text style={styles.sectionTitle}>
                        {isTerms ? '1. Acceptance of Terms' : '1. Information We Collect'}
                    </Text>
                    <Text style={styles.paragraph}>
                        {isTerms
                            ? 'By accessing or using the CivicLens application, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.'
                            : 'We collect information you provide directly to us when you create an account, submit a report, or communicate with us. This includes your name, email address, phone number, and location data associated with reporting civic issues.'}
                    </Text>

                    <Text style={styles.sectionTitle}>
                        {isTerms ? '2. Use License' : '2. How We Use Your Information'}
                    </Text>
                    <Text style={styles.paragraph}>
                        {isTerms
                            ? 'Permission is granted to temporarily download one copy of the materials (information or software) on CivicLens for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.'
                            : 'We use the information we collect to provide, maintain, and improve our services, to coordinate with municipal authorities to resolve civic issues, and to send you technical notices, updates, and support messages.'}
                    </Text>

                    <Text style={styles.sectionTitle}>
                        {isTerms ? '3. Disclaimer' : '3. Sharing of Information'}
                    </Text>
                    <Text style={styles.paragraph}>
                        {isTerms
                            ? 'The materials on CivicLens are provided on an "as is" basis. CivicLens makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.'
                            : 'We may share your location and report details with the relevant municipal departments and officers assigned to resolve the issues you report. We do not sell your personal information to third parties.'}
                    </Text>

                    <Text style={styles.sectionTitle}>
                        {isTerms ? '4. Accuracy of Materials' : '4. Data Security'}
                    </Text>
                    <Text style={styles.paragraph}>
                        {isTerms
                            ? 'The materials appearing on CivicLens could include technical, typographical, or photographic errors. CivicLens does not warrant that any of the materials on its website are accurate, complete, or current.'
                            : 'We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.'}
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
    contentCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    lastUpdated: {
        fontSize: 13,
        color: '#94A3B8',
        marginBottom: 24,
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 12,
        marginTop: 8,
    },
    paragraph: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 24,
        marginBottom: 20,
    },
    footerSpacer: {
        height: 20,
    },
});
