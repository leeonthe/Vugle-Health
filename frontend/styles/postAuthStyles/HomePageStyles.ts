import { CSSProperties } from 'react';

const styles = {
    container: {
      flex: 1,
      backgroundColor: '#F7F9FD',
    },
    scrollContainer: {
      paddingHorizontal: 20,
      paddingTop: 30,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 80,
    },
    headerText: {
      fontSize: 20,
      fontWeight: '600',
    },
    notificationIcon: {
      width: 25,
      height: 25,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      marginBottom: 24,
    },
    cardContent: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 16,
    },
    cardHeaderText: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 26,
      color: '#1B1F23',
    },
    cardHeaderHighlight: {
      color: '#237AF2',
    },
    averageIncrease: {
      backgroundColor: '#F2F7FE',
      borderRadius: 8,
      padding: 8,
      marginBottom: 24,
      marginRight: 119,
    },
    averageIncreaseText: {
      fontSize: 10.5,
      fontWeight: '510',
      lineHeight: 12,
      textAlign: 'center',
    },
    averageIncreaseHighlight: {
      color: '#237AF2',
    },
    graphContainer: {
      color: '#F7F9FD',
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: 22,
    },
    graphItem: {
      alignItems: 'center',
    },
    barsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: 8,
    },
    barGroup: {
      alignItems: 'center',
      marginHorizontal: 2,
    },
    barLabel: {
      color: '#575757',
      fontSize: 10.5,
      lineHeight: 22,
      marginBottom: 4,
    },
    barLabelHighlight: {
      color: '#237AF2',
      fontSize: 10.5,
      lineHeight: 22,
      marginBottom: 4,
    },
    barLow: {
      width: 18,
      height: 66,
      backgroundColor: '#D0D6DA',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    barHigh: {
      width: 18,
      height: 100,
      backgroundColor: '#237AF2',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    graphLabel: {
      color: '#6B7685',
      fontSize: 10.5,
      lineHeight: 22,
      textAlign: 'center',
    },
    button: {
      backgroundColor: '#237AF2',
      borderRadius: 8,
      paddingVertical: 11,
      paddingHorizontal: 24,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '510',
      lineHeight: 15,
      textAlign: 'center',
      width: '100%',
    },
  
  
  
  
    claimsStatusContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      marginBottom: 24,
    },
    claimsStatusHeader: {
      flexDirection: 'row',
      alignSelf: 'stretch',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 14,
    },
    claimsStatusTitle: {
      color: 'black',
      fontSize: 16,
      fontFamily: 'SF Pro',
      fontWeight: '510',
      lineHeight: 22,
      wordWrap: 'break-word',
      textAlign: 'left',
    },
    claimsStatusIcon: {
      width: 5.87,
      height: 10,
      backgroundColor: '#ADB3BA',
    },
    claimsStatusContent: {
      alignSelf: 'stretch',
      padding: 10,
      backgroundColor: '#F6F7F9',
      borderRadius: 8,
      flexDirection: 'row', 
      justifyContent: 'flex-start',
      alignItems: 'center', 
    },
    claimsStatusRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 16,
    },
    claimsStatusIconGreen: {
      width: 20,
      height: 20,
      backgroundColor: '#5EAC24',
      marginRight: 5, 
    },
    claimsStatusTextContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
  
    },
    claimStatusIconContainer: {
      marginRight: 8, 
      marginBottom: 20,
      marginRight: -5,
    },
    claimsStatusTextGray: {
      color: '#6B7685',
      fontSize: 13,
      fontFamily: 'SF Pro',
      fontWeight: '510',
      lineHeight: 22,
      wordWrap: 'break-word',
    },
    claimsStatusTextBlack: {
      color: '#323D4C',
      fontSize: 14,
      fontFamily: 'SF Pro',
      fontWeight: '510',
      lineHeight: 20,
      wordWrap: 'break-word',
    },
  
    bottomNavigation: {
      width: '100%',
      paddingVertical: 20,
      backgroundColor: 'white',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.25,
      shadowRadius: 1,
      elevation: 2,
      marginTop: 8,
    },
    navItem: {
      alignItems: 'center',
    },
    navIcon: {
      width: 24,
      height: 24,
      marginBottom: 4,
    },
    navText: {
      fontSize: 8.5,
      fontWeight: '510',
      color: '#323D4C',
    },
    navTextInactive: {
      fontSize: 8.5,
      fontWeight: '510',
      color: '#ADB3BA',
    },
  
    infoCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      marginBottom: 24,
    },
    infoItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    infoLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoIcon: {
      width: 24,
      height: 24,
      marginRight: 16,
      // backgroundColor: '#red',
    },
    infoTextContainer: {
      justifyContent: 'center',
    },
    infoTitle: {
      fontSize: 13,
      color: '#6B7685',
      fontFamily: 'SF Pro',
      fontWeight: '400',
      lineHeight: 22,
      wordWrap: 'break-word',
    },
    infoValue: {
      fontSize: 16,
      color: '#191F28',
      fontWeight: '590',
      lineHeight: 22,
      wordWrap: 'break-word',
    },
    infoRight: {
      backgroundColor: '#F3F4F6',
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewText: {
      fontSize: 12,
      color: '#323D4C',
      fontWeight: '510',
      lineHeight: 22,
    },
    // DOCUMENT STYLING
    myDocumentsContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      marginBottom: 24,
    },
    myDocumentsRow: {
      flexDirection: 'row', 
      alignItems: 'center',
       justifyContent: 'space-between',
    },
  
  myDocumentsTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',  // Align text in the center vertically if needed
    marginLeft: 10,  // Add some space between the icon and the text
  },
    myDocumentsIcon: {
    
  },
    myDocumentsTitle: {
      color: 'black',
      fontSize: 16,
      fontFamily: 'SF Pro',
      fontWeight: '590',
      lineHeight: 20,
      wordWrap: 'break-word',
      marginBottom: 10,
    },
    myDocumentsSubtitle: {
      color: '#ADB3BA',
      fontSize: 12,
      fontFamily: 'SF Pro',
      fontWeight: '510',
      lineHeight: 15,
      wordWrap: 'break-word',
    },
    myDocumentsIcon:{
  
    },
  
    // CURRENT RESOURCES STYLING
    
    currentResourcesContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      marginBottom: 24,
    },
    currentResourcesHeader: {
      flexDirection: 'row', 
      alignSelf: 'stretch',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    currentResourcesTitle: {
      color: '#191F28',
      fontSize: 16,
      fontFamily: 'SF Pro',
      fontWeight: '510',
      lineHeight: 22,
      wordWrap: 'break-word',
    },
    currentResourcesIcon: {
      width: 7,
      height: 11.92,
      backgroundColor: '#ADB3BA',
    },
    currentResourcesContent: {
      alignSelf: 'stretch',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      gap: 20,
      display: 'flex',
      marginTop: 10,
    },
    resourceRow: {
      width: '100%',
      flexDirection: 'row', 
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8, // Add vertical padding for spacing
    },
    resourceRowContent: {
      flexDirection: 'row', 
      alignItems: 'center',
      flex: 1, 
    },
    resourceIcon: {
      width: 20,
      height: 20,
      marginRight: 16, // Add some space between icon and text
    },
    resourceTextContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      flex: 1, // Allow the text container to stretch
    },
    resourceTitle: {
      color: '#6B7685',
      fontSize: 12,
      fontFamily: 'SF Pro',
      fontWeight: '510',
      lineHeight: 22,
      wordWrap: 'break-word',
    },
    resourceAmount: {
      color: '#191F28',
      fontSize: 16,
      fontFamily: 'SF Pro',
      fontWeight: '590',
      lineHeight: 22,
      wordWrap: 'break-word',
    },
    resourceIconArrow: {
      width: 5.87,
      height: 10,
      backgroundColor: '#ADB3BA',
    },
    exploreMoreContainer: {
      width: '100%',
      padding: 12,
      backgroundColor: '#F2F9FF',
      borderRadius: 8,
      flexDirection: 'row', 
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    exploreMoreContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1, // Allow the content to stretch and fill the space
    },
    exploreMoreIconContainer: {
      marginRight: 10, // Add some space between icon and text
    },
    exploreMoreIcon: {
      width: 16,
      height: 13.71,
      backgroundColor: '#006DC3',
    },
    exploreMoreText: {
      color: '#323D4C',
      fontSize: 12,
      fontFamily: 'SF Pro',
      fontWeight: '510',
      lineHeight: 22,
      wordWrap: 'break-word',
    },

    loadingText: {
      fontSize: 16,
      textAlign: 'center',
    },
  };
  
export default styles