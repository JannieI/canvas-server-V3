--USE [VCIB_DemoDat]; SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE';

SELECT 'VCIB_RaisedPremiums', COUNT(*) FROM VCIB_RaisedPremiums;
SELECT 'VCIB_ReceiptedPremiums', COUNT(*) FROM VCIB_ReceiptedPremiums
SELECT 'VCIB_LossRatios', COUNT(*) FROM VCIB_LossRatios
SELECT 'VCIB_Claims', COUNT(*) FROM VCIB_Claims

SELECT TOP 10 * FROM VCIB_RaisedPremiums;
SELECT TOP 10 * FROM VCIB_ReceiptedPremiums
SELECT TOP 10 * FROM VCIB_LossRatios
SELECT TOP 10 * FROM VCIB_Claims

SELECT DISTINCT TransactionType FROM VCIB_RaisedPremiums;
SELECT DISTINCT EffectiveDate FROM VCIB_RaisedPremiums;
SELECT DISTINCT Product FROM VCIB_RaisedPremiums;
SELECT DISTINCT Broker FROM VCIB_RaisedPremiums;
SELECT DISTINCT Agent FROM VCIB_RaisedPremiums;
SELECT DISTINCT ClientID FROM VCIB_RaisedPremiums;
SELECT DISTINCT PolicyNoID FROM VCIB_RaisedPremiums;
SELECT DISTINCT PaymentMethod FROM VCIB_RaisedPremiums;
SELECT DISTINCT PaymentFrequency FROM VCIB_RaisedPremiums;
SELECT DISTINCT Coi FROM VCIB_RaisedPremiums;
SELECT DISTINCT SubCoi FROM VCIB_RaisedPremiums;
SELECT DISTINCT SasriaCoi FROM VCIB_RaisedPremiums;
SELECT DISTINCT SasriaSubCoi FROM VCIB_RaisedPremiums;
SELECT DISTINCT SasriaClassification FROM VCIB_RaisedPremiums;
SELECT DISTINCT PolicyTransType FROM VCIB_RaisedPremiums;

SELECT Broker, 
    SUM(SumInsured) AS SumInsured, 
    SUM(Fees) AS Fees, 
    SUM(BrokerFee) AS BrokerFee, 
    SUM(AgentFee) AS AgentFee, 
    SUM(RiskPremium) AS RiskPremium, 
    SUM(SasriaPremium) AS SasriaPremium, 
    SUM(NettRiskPremium) AS NettRiskPremium, 
    SUM(RetainedPremium) AS RetainedPremium
    FROM VCIB_RaisedPremiums 
    GROUP BY Broker;